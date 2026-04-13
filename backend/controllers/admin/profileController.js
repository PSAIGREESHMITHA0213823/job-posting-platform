
// const db     = require('../../config/db');
// const bcrypt = require('bcryptjs');
// const { createClient } = require('@supabase/supabase-js');
// const { v4: uuidv4 }   = require('uuid');
// const path             = require('path');

// // ── Supabase client ────────────────────────────────────────────
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY,   // use service role — bypasses RLS
// );

// const BUCKET = 'avatars'; // ✅ create this bucket in Supabase dashboard

// // ── GET /api/admin/profile ─────────────────────────────────────
// const getProfile = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         u.id, u.email, u.role, u.is_active, u.created_at,
//         ap.full_name, ap.phone, ap.bio, ap.avatar_url
//       FROM users u
//       LEFT JOIN admin_profiles ap ON ap.user_id = u.id
//       WHERE u.id = $1
//     `, [req.user.id]);

//     if (!result.rows.length)
//       return res.status(404).json({ success: false, message: 'Profile not found' });

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error('[getProfile]', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch profile' });
//   }
// };

// // ── PUT /api/admin/profile ─────────────────────────────────────
// const updateProfile = async (req, res) => {
//   try {
//     const userId    = req.user.id;
//     const full_name = (req.body.full_name || '').trim();
//     const email     = (req.body.email     || '').trim();
//     const phone     = (req.body.phone     || '').trim();
//     const bio       = (req.body.bio       || '').trim();

//     if (!full_name)
//       return res.status(400).json({ success: false, message: 'full_name is required' });
//     if (full_name.includes('@'))
//       return res.status(400).json({ success: false, message: 'full_name must be a name, not an email' });

//     if (email)
//       await db.query(`UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`, [email, userId]);

//     await db.query(`
//       INSERT INTO admin_profiles (user_id, full_name, phone, bio, avatar_url)
//       VALUES ($1, $2, $3, $4, '')
//       ON CONFLICT (user_id) DO UPDATE SET
//         full_name  = EXCLUDED.full_name,
//         phone      = EXCLUDED.phone,
//         bio        = EXCLUDED.bio,
//         updated_at = NOW()
//     `, [userId, full_name, phone, bio]);

//     const updated = await db.query(`
//       SELECT u.id, u.email, u.role,
//              ap.full_name, ap.phone, ap.bio, ap.avatar_url
//       FROM users u
//       LEFT JOIN admin_profiles ap ON ap.user_id = u.id
//       WHERE u.id = $1
//     `, [userId]);

//     res.json({ success: true, data: updated.rows[0] });
//   } catch (err) {
//     console.error('[updateProfile]', err);
//     res.status(500).json({ success: false, message: 'Failed to update profile' });
//   }
// };

// // ── POST /api/admin/profile/avatar ────────────────────────────
// const uploadAvatarHandler = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!req.file)
//       return res.status(400).json({ success: false, message: 'No file uploaded' });

//     const ext      = path.extname(req.file.originalname).toLowerCase();
//     const fileName = `avatar_${userId}_${uuidv4()}${ext}`;

//     // ── Delete old avatar from Supabase if it exists ───────────
//     const old = await db.query(
//       `SELECT avatar_url FROM admin_profiles WHERE user_id = $1`, [userId]
//     );
//     if (old.rows[0]?.avatar_url) {
//       // Extract just the file path inside the bucket
//       // avatar_url is stored as full public URL, e.g:
//       // https://xxx.supabase.co/storage/v1/object/public/avatars/avatar_1_uuid.jpg
//       const oldUrl = old.rows[0].avatar_url;
//       const oldKey = oldUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
//       if (oldKey) {
//         await supabase.storage.from(BUCKET).remove([oldKey]);
//       }
//     }

//     // ── Upload buffer to Supabase Storage ──────────────────────
//     const { error: uploadError } = await supabase.storage
//       .from(BUCKET)
//       .upload(fileName, req.file.buffer, {
//         contentType: req.file.mimetype,
//         upsert: true,
//       });

//     if (uploadError) {
//       console.error('[uploadAvatar] Supabase upload error:', uploadError);
//       return res.status(500).json({ success: false, message: 'Supabase upload failed' });
//     }

//     // ── Get public URL ─────────────────────────────────────────
//     const { data: publicData } = supabase.storage
//       .from(BUCKET)
//       .getPublicUrl(fileName);

//     const avatar_url = publicData.publicUrl;
//     // e.g. https://xxx.supabase.co/storage/v1/object/public/avatars/avatar_1_uuid.jpg

//     // ── Save URL to DB ─────────────────────────────────────────
//     await db.query(`
//       INSERT INTO admin_profiles (user_id, full_name, phone, bio, avatar_url)
//       VALUES ($1, '', '', '', $2)
//       ON CONFLICT (user_id) DO UPDATE SET
//         avatar_url = EXCLUDED.avatar_url,
//         updated_at = NOW()
//     `, [userId, avatar_url]);

//     // ✅ Return full public URL — frontend stores this directly in AuthContext
//     res.json({ success: true, avatar_url });
//   } catch (err) {
//     console.error('[uploadAvatar]', err);
//     res.status(500).json({ success: false, message: 'Failed to upload avatar' });
//   }
// };

// // ── PUT /api/admin/profile/password ───────────────────────────
// const changePassword = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { current_password, new_password } = req.body;

//     if (!current_password || !new_password)
//       return res.status(400).json({ success: false, message: 'Both passwords are required' });
//     if (new_password.length < 6)
//       return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

//     const userRes = await db.query(`SELECT password FROM users WHERE id = $1`, [userId]);
//     if (!userRes.rows.length)
//       return res.status(404).json({ success: false, message: 'User not found' });

//     const match = await bcrypt.compare(current_password, userRes.rows[0].password);
//     if (!match)
//       return res.status(401).json({ success: false, message: 'Current password is incorrect' });

//     const hashed = await bcrypt.hash(new_password, 10);
//     await db.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [hashed, userId]);

//     res.json({ success: true, message: 'Password changed successfully' });
//   } catch (err) {
//     console.error('[changePassword]', err);
//     res.status(500).json({ success: false, message: 'Failed to change password' });
//   }
// };

// module.exports = { getProfile, updateProfile, uploadAvatarHandler, changePassword };
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET = 'avatars';

const getProfile = async (req, res) => {
try {
const result = await db.query(`
SELECT u.id, u.email, u.role, u.is_active, u.created_at,
ap.full_name, ap.phone, ap.bio, ap.avatar_url
FROM users u
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.id = $1
`, [req.user.id]);
if (!result.rows.length)
return res.status(404).json({ success: false, message: 'Profile not found' });
res.json({ success: true, data: result.rows[0] });
} catch (err) {
console.error('[getProfile]', err);
res.status(500).json({ success: false, message: 'Failed to fetch profile' });
}
};

const updateProfile = async (req, res) => {
try {
const userId = req.user.id;
const full_name = (req.body.full_name || '').trim();
const email = (req.body.email || '').trim();
const phone = (req.body.phone || '').trim();
const bio = (req.body.bio || '').trim();
if (!full_name)
return res.status(400).json({ success: false, message: 'full_name is required' });
if (full_name.includes('@'))
return res.status(400).json({ success: false, message: 'full_name must be a name, not an email' });
if (email)
await db.query(`UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`, [email, userId]);
await db.query(`
INSERT INTO admin_profiles (user_id, full_name, phone, bio, avatar_url)
VALUES ($1, $2, $3, $4, '')
ON CONFLICT (user_id) DO UPDATE SET
full_name = EXCLUDED.full_name,
phone = EXCLUDED.phone,
bio = EXCLUDED.bio,
updated_at = NOW()
`, [userId, full_name, phone, bio]);
const updated = await db.query(`
SELECT u.id, u.email, u.role,
ap.full_name, ap.phone, ap.bio, ap.avatar_url
FROM users u
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE u.id = $1
`, [userId]);
res.json({ success: true, data: updated.rows[0] });
} catch (err) {
console.error('[updateProfile]', err);
res.status(500).json({ success: false, message: 'Failed to update profile' });
}
};

const uploadAvatarHandler = async (req, res) => {
try {
const userId = req.user.id;
if (!req.file)
return res.status(400).json({ success: false, message: 'No file uploaded' });
const ext = path.extname(req.file.originalname).toLowerCase();
const fileName = `avatar_${userId}_${uuidv4()}${ext}`;
const old = await db.query(`SELECT avatar_url FROM admin_profiles WHERE user_id = $1`, [userId]);
if (old.rows[0]?.avatar_url) {
const oldUrl = old.rows[0].avatar_url;
const oldKey = oldUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
if (oldKey) await supabase.storage.from(BUCKET).remove([oldKey]);
}
const { error: uploadError } = await supabase.storage
.from(BUCKET)
.upload(fileName, req.file.buffer, {
contentType: req.file.mimetype,
upsert: true,
});
if (uploadError) {
console.error('[uploadAvatar] Supabase upload error:', uploadError);
return res.status(500).json({ success: false, message: 'Supabase upload failed' });
}
const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
const avatar_url = publicData.publicUrl;
await db.query(`
INSERT INTO admin_profiles (user_id, full_name, phone, bio, avatar_url)
VALUES ($1, '', '', '', $2)
ON CONFLICT (user_id) DO UPDATE SET
avatar_url = EXCLUDED.avatar_url,
updated_at = NOW()
`, [userId, avatar_url]);
res.json({ success: true, avatar_url });
} catch (err) {
console.error('[uploadAvatar]', err);
res.status(500).json({ success: false, message: 'Failed to upload avatar' });
}
};

const changePassword = async (req, res) => {
try {
const userId = req.user.id;
const { current_password, new_password } = req.body;
if (!current_password || !new_password)
return res.status(400).json({ success: false, message: 'Both passwords are required' });
if (new_password.length < 6)
return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
const userRes = await db.query(`SELECT password FROM users WHERE id = $1`, [userId]);
if (!userRes.rows.length)
return res.status(404).json({ success: false, message: 'User not found' });
const match = await bcrypt.compare(current_password, userRes.rows[0].password);
if (!match)
return res.status(401).json({ success: false, message: 'Current password is incorrect' });
const hashed = await bcrypt.hash(new_password, 10);
await db.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [hashed, userId]);
res.json({ success: true, message: 'Password changed successfully' });
} catch (err) {
console.error('[changePassword]', err);
res.status(500).json({ success: false, message: 'Failed to change password' });
}
};

module.exports = { getProfile, updateProfile, uploadAvatarHandler, changePassword };