
// // import React, { useEffect, useState, useRef } from 'react';
// // import axios from 'axios';
// // import { useCompany } from '../../context/CompanyContext'; 
// // const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// // const getAuthHeaders = () => {
// //   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
// //   return token ? { Authorization: `Bearer ${token}` } : {};
// // };
// // const Label = ({ children }) => (
// //   <div style={{
// //     fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5,
// //     textTransform: 'uppercase', letterSpacing: '0.6px',
// //   }}>
// //     {children}
// //   </div>
// // );

// // const SectionTitle = ({ children }) => (
// //   <h4 style={{
// //     fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 16,
// //     paddingBottom: 10, borderBottom: '1px solid #f0f0f5',
// //   }}>
// //     {children}
// //   </h4>
// // );

// // const inputStyle = {
// //   width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
// //   borderRadius: 8, fontSize: 14, color: '#1a1f36',
// //   boxSizing: 'border-box', outline: 'none', background: '#fafafa',
// // };

// // const card = {
// //   background: '#fff', borderRadius: 12, padding: 24,
// //   boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20,
// // };
// // const CompanyProfile = () => {
// //   const { updateLogo, updateName, refreshProfile } = useCompany(); 
// //   const [form, setForm] = useState({
// //     name: '', description: '', industry: '', company_size: '',
// //     website: '', address: '', city: '', country: '',
// //   });
// //   const [loading, setLoading]         = useState(true);
// //   const [saving, setSaving]           = useState(false);
// //   const [success, setSuccess]         = useState('');
// //   const [error, setError]             = useState('');
// //   const [logoPreview, setLogoPreview] = useState(null);
// //   const fileRef = useRef();
// //   useEffect(() => {
// //     axios.get(`${API}/company/profile`, { headers: getAuthHeaders() })
// //       .then(res => {
// //         const d = res.data?.data || {};
// //         setForm({
// //           name:         d.name         || '',
// //           description:  d.description  || '',
// //           industry:     d.industry     || '',
// //           company_size: d.company_size || '',
// //           website:      d.website      || '',
// //           address:      d.address      || '',
// //           city:         d.city         || '',
// //           country:      d.country      || '',
// //    });
// //    if (d.logo_url) {
// //           setLogoPreview(
// //             d.logo_url.startsWith('http')
// //               ? d.logo_url
// //               : `http://localhost:5000${d.logo_url}`
// //           );
// //         }
// //       })
// //       .catch(err => {
// //         if (!err.response) setError('Network error — check server is running.');
// //         else if (err.response.status === 401) setError('Session expired — please log in again.');
// //         else setError(err.response?.data?.message || 'Failed to load profile.');
// //       })
// //       .finally(() => setLoading(false));
// //   }, []);
// //   const handleFileChange = (e) => {
// //     const f = e.target.files[0];
// //     if (!f) return;
// //     if (f.size > 2 * 1024 * 1024) {
// //       setError('Logo must be under 2 MB.');
// //       e.target.value = '';
// //       return;
// //     }
// //     setLogoPreview(URL.createObjectURL(f));
// //     setError('');
// //   };
// //   const handleSave = async () => {
// //     if (!form.name.trim()) { setError('Company name is required.'); return; }
// //     setSaving(true); setError(''); setSuccess('');
// //     try {
// //       const fd = new FormData();
// //       Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
// //       if (fileRef.current?.files[0]) fd.append('logo', fileRef.current.files[0]);

// //       const res = await axios.put(`${API}/company/profile`, fd, {
// //         headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() },
// //       });

// //       const saved = res.data?.data || {};
// //      if (saved.logo_url) updateLogo(saved.logo_url);
// //       if (saved.name)     updateName(saved.name);
// //       if (!saved.logo_url && !saved.name) refreshProfile();
// //       setSuccess('Profile updated successfully!');
// //       setTimeout(() => setSuccess(''), 4000);
// //     } catch (e) {
// //       setError(e.response?.data?.message || 'Update failed. Please try again.');
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const inp = (field) => ({
// //     value: form[field] || '',
// //     onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
// //     style: inputStyle,
// //   });
// //   return (
// //     <div style={{ maxWidth: 780 }}>
// //       <div style={{ marginBottom: 24 }}>
// //         <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f36', marginBottom: 4 }}>
// //           Company Profile
// //         </h2>
// //         <p style={{ color: '#6b7280', fontSize: 14 }}>
// //           Update your company information visible to job seekers
// //         </p>
// //       </div>

// //       {error && (
// //         <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fee2e2',
// //           color: '#991b1b', borderRadius: 8, fontSize: 13 }}>
// //           ⚠️ {error}
// //         </div>
// //       )}
// //       {success && (
// //         <div style={{ marginBottom: 16, padding: '12px 16px', background: '#d1fae5',
// //           color: '#065f46', borderRadius: 8, fontSize: 13 }}>
// //           ✅ {success}
// //         </div>
// //       )}

// //       {loading ? (
// //         <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
// //           <div style={{ fontSize: 24, marginBottom: 10 }}>⏳</div>
// //           Loading profile…
// //         </div>
// //       ) : (
// //         <>
// //           <div style={card}>
// //             <SectionTitle>Company Logo</SectionTitle>
// //             <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
// //               <div style={{
// //                 width: 80, height: 80, borderRadius: 12, flexShrink: 0,
// //                 border: '2px dashed #e5e7eb', overflow: 'hidden',
// //                 background: '#f9fafb', display: 'flex',
// //                 alignItems: 'center', justifyContent: 'center',
// //               }}>
// //                 {logoPreview
// //                   ? <img src={logoPreview} alt="logo"
// //                       style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                   : <span style={{ fontSize: 28 }}>🏢</span>}
// //               </div>
// //               <div>
// //                 <button onClick={() => fileRef.current.click()} style={{
// //                   padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
// //                   background: '#fff', cursor: 'pointer', fontSize: 13,
// //                   fontWeight: 600, color: '#374151',
// //                 }}>
// //                   Upload Logo
// //                 </button>
// //                 <input
// //                   ref={fileRef} type="file"
// //                   accept="image/png,image/jpeg,image/webp"
// //                   style={{ display: 'none' }}
// //                   onChange={handleFileChange}
// //                 />
// //                 <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
// //                   PNG, JPG up to 2 MB
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //     <div style={card}>
// //             <SectionTitle>Basic Information</SectionTitle>
// //             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
// //               <div style={{ gridColumn: '1 / -1' }}>
// //                 <Label>Company Name *</Label>
// //                 <input {...inp('name')} placeholder="Your company name" />
// //               </div>
// //               <div>
// //                 <Label>Industry</Label>
// //                 <input {...inp('industry')} placeholder="e.g. Technology" />
// //               </div>
// //               <div>
// //                 <Label>Company Size</Label>
// //                 <select {...inp('company_size')}>
// //                   <option value="">Select size</option>
// //                   {['1–10', '11–50', '51–200', '201–500', '500+'].map(s => (
// //                     <option key={s} value={s}>{s}</option>
// //                   ))}
// //                 </select>
// //               </div>
// //       <div style={{ gridColumn: '1 / -1' }}>
// //                 <Label>Website</Label>
// //                 <input {...inp('website')} type="url" placeholder="https://yourcompany.com" />
// //               </div>
// //               <div style={{ gridColumn: '1 / -1' }}>
// //                 <Label>Description</Label>
// //                 <textarea
// //                   {...inp('description')} rows={4}
// //                   placeholder="Tell candidates about your company culture and mission…"
// //                   style={{ ...inputStyle, resize: 'vertical' }}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //      <div style={card}>
// //             <SectionTitle>Location</SectionTitle>
// //             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
// //               <div style={{ gridColumn: '1 / -1' }}>
// //                 <Label>Address</Label>
// //                 <input {...inp('address')} placeholder="Street address" />
// //               </div>
// //               <div>
// //                 <Label>City</Label>
// //                 <input {...inp('city')} placeholder="City" />
// //               </div>
// //               <div>
// //                 <Label>Country</Label>
// //                 <input {...inp('country')} placeholder="Country" />
// //               </div>
// //             </div>
// //           </div>
// //           <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
// //             <button onClick={handleSave} disabled={saving} style={{
// //               padding: '10px 30px',
// //               background: saving ? '#818cf8' : '#4f6ef7',
// //               color: '#fff', border: 'none', borderRadius: 10,
// //               cursor: saving ? 'not-allowed' : 'pointer',
// //               fontWeight: 700, fontSize: 15,
// //               boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
// //             }}>
// //               {saving ? 'Saving…' : 'Save Changes'}
// //             </button>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default CompanyProfile;
// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const CompanyProfile = () => {
//   const [profile, setProfile] = useState(null);
//   const [form, setForm] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [logoPreview, setLogoPreview] = useState(null);
//   const fileRef = useRef();

//   useEffect(() => {
//     axios.get(`${API}/company/profile`, { withCredentials: true })
//       .then(r => {
//         const d = r.data.data;
//         setProfile(d);
//         setForm({
//           name: d.name || '',
//           description: d.description || '',
//           industry: d.industry || '',
//           company_size: d.company_size || '',
//           website: d.website || '',
//           address: d.address || '',
//           city: d.city || '',
//           country: d.country || '',
//         });
//         if (d.logo_url) setLogoPreview(`http://localhost:5000${d.logo_url}`);
//       })
//       .catch(() => setError('Failed to load profile'))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     if (f) setLogoPreview(URL.createObjectURL(f));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setError('');
//     setSuccess('');
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
//       if (fileRef.current?.files[0]) fd.append('logo', fileRef.current.files[0]);

//       await axios.put(`${API}/company/profile`, fd, {
//         withCredentials: true,
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setSuccess('Profile updated successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (e) {
//       setError(e.response?.data?.message || 'Update failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const inp = (field) => ({
//     value: form[field] || '',
//     onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
//     style: inputStyle,
//   });

//   if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>;

//   return (
//     <div style={{ maxWidth: 900 }}>
//       <div style={{ marginBottom: 24 }}>
//         <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1f36', marginBottom: 4 }}>Company Profile</h2>
//         <p style={{ color: '#6b7280' }}>Update your company information visible to job seekers</p>
//       </div>

//       {error && <div style={{ marginBottom: 16, padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>{error}</div>}
//       {success && <div style={{ marginBottom: 16, padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8 }}>{success}</div>}

//       <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
//         <Label>Company Logo</Label>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
//           <div style={{
//             width: 80, height: 80, borderRadius: 12, border: '2px dashed #e5e7eb',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             overflow: 'hidden', background: '#f9fafb', flexShrink: 0,
//           }}>
//             {logoPreview
//               ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               : <span style={{ fontSize: 28 }}>🏢</span>}
//           </div>
//           <div>
//             <button
//               onClick={() => fileRef.current.click()}
//               style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}
//             >Upload Logo</button>
//             <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
//             <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>PNG, JPG up to 2MB</div>
//           </div>
//         </div>
//       </div>
//       <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
//         <SectionTitle>Basic Information</SectionTitle>
//         <div style={{ display: 'grid', gridTemplaterows: '1fr 1fr', gap: 16 }}>
//           <div style={{ gridRow: '1/-1' }}>
//             <Label>Company Name</Label>
//             <input {...inp('name')} placeholder="Your company name" />
//           </div>
//           <div>
//             <Label>Industry</Label>
//             <input {...inp('industry')} placeholder="e.g. Technology" />
//           </div>
//           <div>
//             <Label>Company Size</Label>
//             <select {...inp('company_size')} style={inputStyle}>
//               <option value="">Select size</option>
//               <option value="1-10">1–10</option>
//               <option value="11-50">11–50</option>
//               <option value="51-200">51–200</option>
//               <option value="201-500">201–500</option>
//               <option value="500+">500+</option>
//             </select>
//           </div>
//           <div style={{ gridColumn: '1/-1' }}>
//             <Label>Website</Label>
//             <input {...inp('website')} placeholder="https://yourcompany.com" />
//           </div>
//           <div style={{ gridColumn: '1/-1' }}>
//             <Label>Description</Label>
//             <textarea {...inp('description')} rows={4} placeholder="Tell candidates about your company…" style={{ ...inputStyle, resize: 'vertical' }} />
//           </div>
//         </div>
//       </div>
//       <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
//         <SectionTitle>Location</SectionTitle>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//           <div style={{ gridColumn: '1/-1' }}>
//             <Label>Address</Label>
//             <input {...inp('address')} placeholder="Street address" />
//           </div>
//           <div>
//             <Label>City</Label>
//             <input {...inp('city')} placeholder="City" />
//           </div>
//           <div>
//             <Label>Country</Label>
//             <input {...inp('country')} placeholder="Country" />
//           </div>
//         </div>
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//         <button onClick={handleSave} disabled={saving} style={{
//           padding: '10px 28px', background: '#4f6ef7', color: '#fff', border: 'none',
//           borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15,
//           opacity: saving ? 0.7 : 1,
//         }}>
//           {saving ? 'Saving…' : 'Save Changes'}
//         </button>
//       </div>
//     </div>
//   );
// };

// const Label = ({ children }) => (
//   <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
//     {children}
//   </div>
// );

// const SectionTitle = ({ children }) => (
//   <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1a1f36', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
//     {children}
//   </h4>
// );

// const inputStyle = {
//   width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
//   fontSize: 14, color: '#1a1f36', boxSizing: 'border-box', outline: 'none', background: '#fafafa',
// };

// export default CompanyProfile;


import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useCompany } from '../../context/CompanyContext'; 
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const Label = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: '0.6px',
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h4 style={{
    fontSize: 14, fontWeight: 700, color: '#1a1f36', marginBottom: 16,
    paddingBottom: 10, borderBottom: '1px solid #f0f0f5',
  }}>
    {children}
  </h4>
);

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, color: '#1a1f36',
  boxSizing: 'border-box', outline: 'none', background: '#fafafa',
};

const card = {
  background: '#fff', borderRadius: 12, padding: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20,
};
const CompanyProfile = () => {
  const { updateLogo, updateName, refreshProfile } = useCompany(); 
  const [form, setForm] = useState({
    name: '', description: '', industry: '', company_size: '',
    website: '', address: '', city: '', country: '',
  });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const fileRef = useRef();
  useEffect(() => {
    axios.get(`${API}/company/profile`, { headers: getAuthHeaders() })
      .then(res => {
        const d = res.data?.data || {};
        setForm({
          name:         d.name         || '',
          description:  d.description  || '',
          industry:     d.industry     || '',
          company_size: d.company_size || '',
          website:      d.website      || '',
          address:      d.address      || '',
          city:         d.city         || '',
          country:      d.country      || '',
   });
   if (d.logo_url) {
          setLogoPreview(
            d.logo_url.startsWith('http')
              ? d.logo_url
              : `http://localhost:5000${d.logo_url}`
          );
        }
      })
      .catch(err => {
        if (!err.response) setError('Network error — check server is running.');
        else if (err.response.status === 401) setError('Session expired — please log in again.');
        else setError(err.response?.data?.message || 'Failed to load profile.');
      })
      .finally(() => setLoading(false));
  }, []);
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2 MB.');
      e.target.value = '';
      return;
    }
    setLogoPreview(URL.createObjectURL(f));
    setError('');
  };
  const handleSave = async () => {
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (fileRef.current?.files[0]) fd.append('logo', fileRef.current.files[0]);

      const res = await axios.put(`${API}/company/profile`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() },
      });

      const saved = res.data?.data || {};
     if (saved.logo_url) updateLogo(saved.logo_url);
      if (saved.name)     updateName(saved.name);
      if (!saved.logo_url && !saved.name) refreshProfile();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (field) => ({
    value: form[field] || '',
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
    style: inputStyle,
  });
  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1f36', marginBottom: 4 }}>
          Company Profile
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Update your company information visible to job seekers
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fee2e2',
          color: '#991b1b', borderRadius: 8, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#d1fae5',
          color: '#065f46', borderRadius: 8, fontSize: 13 }}>
          ✅ {success}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⏳</div>
          Loading profile…
        </div>
      ) : (
        <>
          <div style={card}>
            <SectionTitle>Company Logo</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                border: '2px dashed #e5e7eb', overflow: 'hidden',
                background: '#f9fafb', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28 }}>🏢</span>}
              </div>
              <div>
                <button onClick={() => fileRef.current.click()} style={{
                  padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
                  background: '#fff', cursor: 'pointer', fontSize: 13,
                  fontWeight: 600, color: '#374151',
                }}>
                  Upload Logo
                </button>
                <input
                  ref={fileRef} type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                  PNG, JPG up to 2 MB
                </div>
              </div>
            </div>
          </div>
    <div style={card}>
            <SectionTitle>Basic Information</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Company Name *</Label>
                <input {...inp('name')} placeholder="Your company name" />
              </div>
              <div>
                <Label>Industry</Label>
                <input {...inp('industry')} placeholder="e.g. Technology" />
              </div>
              <div>
                <Label>Company Size</Label>
                <select {...inp('company_size')}>
                  <option value="">Select size</option>
                  {['1–10', '11–50', '51–200', '201–500', '500+'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
      <div style={{ gridColumn: '1 / -1' }}>
                <Label>Website</Label>
                <input {...inp('website')} type="url" placeholder="https://yourcompany.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Description</Label>
                <textarea
                  {...inp('description')} rows={4}
                  placeholder="Tell candidates about your company culture and mission…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
     <div style={card}>
            <SectionTitle>Location</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Address</Label>
                <input {...inp('address')} placeholder="Street address" />
              </div>
              <div>
                <Label>City</Label>
                <input {...inp('city')} placeholder="City" />
              </div>
              <div>
                <Label>Country</Label>
                <input {...inp('country')} placeholder="Country" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 30px',
              background: saving ? '#818cf8' : '#4f6ef7',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15,
              boxShadow: '0 2px 8px rgba(79,110,247,0.3)',
            }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyProfile;