const nodemailer = require('nodemailer')

// ─── Transporter ──────────────────────────────────────────────────────────────
// Configure via environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false)
//   SMTP_USER, SMTP_PASS
//   MAIL_FROM  (e.g. '"MyApp" <no-reply@myapp.com>')
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',   // true → 465, false → STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.MAIL_FROM || '"JobPortal" <no-reply@jobportal.com>'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Low-level send. All other helpers call this.
 * @param {{ to, subject, html, text? }} opts
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html, text })
    console.log(`[mailer] sent to ${to} — messageId: ${info.messageId}`)
    return info
  } catch (err) {
    // Log but never crash the calling request
    console.error(`[mailer] failed to send to ${to}:`, err.message)
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

const baseTemplate = (bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f6f9; font-family: Arial, sans-serif; }
    .wrapper { max-width:560px; margin:40px auto; background:#ffffff;
               border-radius:10px; overflow:hidden;
               box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .header  { background:#4f46e5; padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#ffffff; font-size:22px; letter-spacing:.5px; }
    .body    { padding:32px 40px; color:#374151; line-height:1.6; }
    .body h2 { margin-top:0; color:#111827; font-size:18px; }
    .pill    { display:inline-block; background:#ede9fe; color:#4f46e5;
               padding:4px 12px; border-radius:999px; font-size:13px;
               font-weight:600; }
    .btn     { display:inline-block; margin-top:20px; padding:12px 28px;
               background:#4f46e5; color:#ffffff; border-radius:8px;
               text-decoration:none; font-weight:600; font-size:14px; }
    .footer  { background:#f9fafb; padding:20px 40px; text-align:center;
               font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>JobPortal</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">© ${new Date().getFullYear()} JobPortal. All rights reserved.</div>
  </div>
</body>
</html>`

// ─── Exported mail senders ────────────────────────────────────────────────────

/**
 * Welcome email sent when admin creates a user OR when a user self-registers.
 *
 * @param {{ email: string, full_name: string, role: string, password?: string, loginUrl?: string }} opts
 *   password — plain-text password (only include when admin creates the account)
 *   loginUrl — defaults to FRONTEND_URL/login
 */
const sendWelcomeEmail = async ({ email, full_name, role, password, loginUrl }) => {
  const name    = full_name || email
  const roleLabel = role === 'company_manager' ? 'Company Manager'
                  : role === 'admin'           ? 'Administrator'
                  :                              'Employee'
  const url     = loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`

  const credentialsBlock = password
    ? `<p>Your login credentials:</p>
       <table style="background:#f3f4f6;border-radius:8px;padding:16px;width:100%;border-collapse:collapse">
         <tr><td style="padding:4px 8px;color:#6b7280;font-size:13px">Email</td>
             <td style="padding:4px 8px;font-weight:600">${email}</td></tr>
         <tr><td style="padding:4px 8px;color:#6b7280;font-size:13px">Password</td>
             <td style="padding:4px 8px;font-weight:600;letter-spacing:.5px">${password}</td></tr>
       </table>
       <p style="font-size:13px;color:#ef4444">⚠️ Please change your password after your first login.</p>`
    : `<p>Your account is now active. Click below to sign in.</p>`

  const html = baseTemplate(`
    <h2>Welcome to JobPortal, ${name}! 🎉</h2>
    <p>Your account has been successfully created.</p>
    <p>Account type: <span class="pill">${roleLabel}</span></p>
    ${credentialsBlock}
    <a class="btn" href="${url}">Go to Login →</a>
  `)

  await sendMail({
    to:      email,
    subject: 'Welcome to JobPortal – Your account is ready',
    html,
    text:    `Welcome ${name}! Your JobPortal account (${roleLabel}) has been created. Login at ${url}`,
  })
}

/**
 * Notify user their account status changed (active/inactive).
 */
const sendStatusChangeEmail = async ({ email, full_name, is_active }) => {
  const name   = full_name || email
  const status = is_active ? 'reactivated' : 'deactivated'
  const color  = is_active ? '#16a34a'     : '#dc2626'
  const icon   = is_active ? '✅'           : '🚫'

  const html = baseTemplate(`
    <h2>Account ${is_active ? 'Reactivated' : 'Deactivated'}</h2>
    <p>Hi ${name},</p>
    <p>Your JobPortal account has been <strong style="color:${color}">${status}</strong> by an administrator. ${icon}</p>
    ${is_active
      ? `<p>You can now log in and use the platform normally.</p>`
      : `<p>If you believe this is a mistake, please contact support.</p>`}
  `)

  await sendMail({
    to:      email,
    subject: `JobPortal – Your account has been ${status}`,
    html,
    text:    `Hi ${name}, your JobPortal account has been ${status}.`,
  })
}

module.exports = { sendWelcomeEmail, sendStatusChangeEmail }