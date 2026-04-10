// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getJobDetail, applyToJob } from '../services/api';
// import LoadingSpinner from '../components/LoadingSpinner';

// const JobDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [applying, saetApplying] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [coverLetter, setCoverLetter] = useState('');
//   const [resume, setResume] = useState(null);
//   const [message, setMessage] = useState('');
//   const [msgType, setMsgType] = useState('');

//   useEffect(() => {
//     getJobDetail(id).then(d => setJob(d.data)).catch(() => setJob(null)).finally(() => setLoading(false));
//   }, [id]);

//   const handleApply = async (e) => {
//     e.preventDefault();
//     setApplying(true);
//     try {
//       const fd = new FormData();
//       fd.append('job_id', id);
//       if (coverLetter) fd.append('cover_letter', coverLetter);
//       if (resume) fd.append('resume', resume);
//       await applyToJob(fd);
//       setMessage('Application submitted successfully!');
//       setMsgType('success');
//       setShowModal(false);
//     } catch (err) {
//       setMessage(err.message || 'Application failed');
//       setMsgType('danger');
//     }
//     setApplying(false);
//   };

//   if (loading) return <LoadingSpinner text="Loading job details..." />;
//   if (!job) return <div className="page-content"><div className="alert alert-warning">Job not found.</div></div>;

//   return (
//     <div className="page-content">
//       <button className="btn btn-sm btn-outline-secondary rounded-pill mb-4" onClick={() => navigate(-1)}>
//         <i className="bi bi-arrow-left me-2" />Back
//       </button>

//       {message && <div className={'alert alert-' + msgType + ' d-flex align-items-center gap-2'}>
//         <i className={'bi bi-' + (msgType === 'success' ? 'check-circle' : 'exclamation-circle')} />
//         {message}
//       </div>}

//       <div className="job-detail-card">
//         <div className="job-detail-header">
//           <div className="d-flex align-items-start gap-3">
//             {job.logo_url
//               ? <img src={'http://localhost:5000' + job.logo_url} alt={job.company_name} className="detail-logo" />
//               : <div className="detail-logo-placeholder">{job.company_name?.[0]}</div>}
//             <div>
//               <h3 className="fw-bold mb-1">{job.title}</h3>
//               <div className="d-flex align-items-center gap-2 flex-wrap">
//                 <span className="text-muted fw-medium">{job.company_name}</span>
//                 {job.company_verified && <i className="bi bi-patch-check-fill text-primary" />}
//                 {job.city && <span className="text-muted small"><i className="bi bi-geo-alt me-1" />{job.city}, {job.country}</span>}
//               </div>
//             </div>
//           </div>
//           <button className="btn btn-primary btn-lg rounded-pill px-4" onClick={() => setShowModal(true)}>
//             <i className="bi bi-send me-2" />Apply Now
//           </button>
//         </div>

//         <div className="job-detail-tags">
//           <span className="detail-tag"><i className="bi bi-briefcase me-1" />{(job.employment_type || '').replace('_', ' ')}</span>
//           {job.is_remote && <span className="detail-tag text-info"><i className="bi bi-wifi me-1" />Remote</span>}
//           {job.experience_required > 0 && <span className="detail-tag"><i className="bi bi-bar-chart me-1" />{job.experience_required}+ yrs exp</span>}
//           {job.salary_min && <span className="detail-tag text-success"><i className="bi bi-currency-dollar me-1" />{Number(job.salary_min).toLocaleString()} – {Number(job.salary_max).toLocaleString()}</span>}
//           {job.openings && <span className="detail-tag"><i className="bi bi-people me-1" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
//           {job.application_deadline && <span className="detail-tag text-danger"><i className="bi bi-calendar-x me-1" />Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>}
//         </div>

//         <div className="row g-4 mt-2">
//           <div className="col-lg-8">
//             {job.description && (<>
//               <h5 className="fw-semibold mb-3">About the Role</h5>
//               <p className="text-muted lh-lg">{job.description}</p>
//             </>)}
//             {job.requirements && (<>
//               <h5 className="fw-semibold mb-3 mt-4">Requirements</h5>
//               <p className="text-muted lh-lg">{job.requirements}</p>
//             </>)}
//             {job.responsibilities && (<>
//               <h5 className="fw-semibold mb-3 mt-4">Responsibilities</h5>
//               <p className="text-muted lh-lg">{job.responsibilities}</p>
//             </>)}
//             {job.skills_required?.length > 0 && (<>
//               <h5 className="fw-semibold mb-3 mt-4">Skills Required</h5>
//               <div className="d-flex flex-wrap gap-2">
//                 {job.skills_required.map(s => <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{s}</span>)}
//               </div>
//             </>)}
//           </div>
//           <div className="col-lg-4">
//             <div className="company-info-card">
//               <h6 className="fw-bold mb-3">Company Info</h6>
//               <dl className="mb-0">
//                 {job.industry && <><dt className="text-muted small">Industry</dt><dd className="fw-medium mb-2">{job.industry}</dd></>}
//                 {job.company_size && <><dt className="text-muted small">Size</dt><dd className="fw-medium mb-2">{job.company_size}</dd></>}
//                 {job.website && <><dt className="text-muted small">Website</dt><dd className="mb-2"><a href={job.website} target="_blank" rel="noreferrer" className="text-primary">{job.website}</a></dd></>}
//                 {job.company_description && <><dt className="text-muted small">About</dt><dd className="text-muted small mb-0">{job.company_description?.slice(0, 200)}...</dd></>}
//               </dl>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-box" onClick={e => e.stopPropagation()}>
//             <div className="modal-box-header">
//               <h5 className="fw-bold mb-0">Apply for {job.title}</h5>
//               <button className="btn-icon" onClick={() => setShowModal(false)}><i className="bi bi-x-lg" /></button>
//             </div>
//             <form onSubmit={handleApply}>
//               <div className="mb-3">
//                 <label className="form-label fw-medium">Cover Letter</label>
//                 <textarea className="form-control" rows={5} placeholder="Tell them why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
//               </div>
//               <div className="mb-4">
//                 <label className="form-label fw-medium">Resume (PDF/DOC)</label>
//                 <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
//                 <div className="form-text">Leave empty to use your profile resume.</div>
//               </div>
//               <button type="submit" className="btn btn-primary w-100 rounded-pill" disabled={applying}>
//                 {applying ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
//                 {applying ? 'Submitting...' : 'Submit Application'}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDetail, applyToJob, getProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyEdu = { institution: '', degree: '', field: '', start_year: '', end_year: '', grade: '' };
const emptyExp = { company: '', role: '', start: '', end: '', current: false, description: '' };
const emptyProject = { name: '', description: '', url: '', tech: '' };

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', location: '',
    linkedin_url: '', github_url: '', portfolio_url: '',
    cover_letter: '',
    availability: '', notice_period: '', expected_salary: '',
  });
  const [education, setEducation] = useState([{ ...emptyEdu }]);
  const [experience, setExperience] = useState([{ ...emptyExp }]);
  const [projects, setProjects] = useState([{ ...emptyProject }]);
  const [certifications, setCertifications] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [resume, setResume] = useState(null);

  useEffect(() => {
    getJobDetail(id).then(d => setJob(d.data)).catch(() => setJob(null)).finally(() => setLoading(false));
    
    getProfile().then(d => {
      const p = d.data;
      setForm(prev => ({
        ...prev,
        full_name: p.full_name || '',
        phone: p.phone || '',
        location: p.location || '',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
        portfolio_url: p.portfolio_url || '',
      }));
      setSkillsInput((p.skills || []).join(', '));
      setCertifications((p.certifications || []).join(', '));
      if (p.education) setEducation(p.education.length ? p.education : [{ ...emptyEdu }]);
      if (p.work_experience) setExperience(p.work_experience.length ? p.work_experience : [{ ...emptyExp }]);
    }).catch(() => {});
  }, [id]);

  const setF = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const setEdu = (i, k, v) => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const addEdu = () => setEducation(prev => [...prev, { ...emptyEdu }]);
  const removeEdu = (i) => setEducation(prev => prev.filter((_, idx) => idx !== i));

  const setExp = (i, k, v) => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const addExp = () => setExperience(prev => [...prev, { ...emptyExp }]);
  const removeExp = (i) => setExperience(prev => prev.filter((_, idx) => idx !== i));

  const setPrj = (i, k, v) => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const addPrj = () => setProjects(prev => [...prev, { ...emptyProject }]);
  const removePrj = (i) => setProjects(prev => prev.filter((_, idx) => idx !== i));

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('job_id', id);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('education', JSON.stringify(education));
      fd.append('work_experience', JSON.stringify(experience));
      fd.append('projects', JSON.stringify(projects));
      fd.append('certifications', certifications);
      fd.append('skills', skillsInput);
      if (resume) fd.append('resume', resume);
      await applyToJob(fd);
      setMessage('Application submitted successfully! Good luck! 🎉');
      setMsgType('success');
      setShowModal(false);
      setStep(1);
    } catch (err) {
      setMessage(err.message || 'Application failed. Please try again.');
      setMsgType('danger');
    }
    setApplying(false);
  };

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div className="page-content"><div className="alert alert-warning">Job not found.</div></div>;

  const stepLabels = ['Basic Info', 'Education', 'Experience & Projects', 'Skills & Docs'];

  return (
    <div className="page-content">
      <button className="btn btn-sm btn-outline-secondary rounded-pill mb-4" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2" />Back
      </button>

      {message && (
        <div className={'alert alert-' + msgType + ' d-flex align-items-center gap-2'}>
          <i className={'bi bi-' + (msgType === 'success' ? 'check-circle' : 'exclamation-circle')} />
          {message}
        </div>
      )}

      <div className="job-detail-card">
        <div className="job-detail-header">
          <div className="d-flex align-items-start gap-3">
            {job.logo_url
              ? <img src={'http://localhost:5000' + job.logo_url} alt={job.company_name} className="detail-logo" />
              : <div className="detail-logo-placeholder">{job.company_name?.[0]}</div>}
            <div>
              <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{job.title}</h3>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 600, color: '#374151' }}>{job.company_name}</span>
                {job.company_verified && <i className="bi bi-patch-check-fill text-primary" />}
                {job.city && (
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>
                    <i className="bi bi-geo-alt me-1" />{job.city}, {job.country}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-lg rounded-pill px-4" onClick={() => setShowModal(true)}>
            <i className="bi bi-send me-2" />Apply Now
          </button>
        </div>

        <div className="job-detail-tags">
          <span className="detail-tag"><i className="bi bi-briefcase me-1" />{(job.employment_type || '').replace('_', ' ')}</span>
          {job.is_remote && <span className="detail-tag text-info"><i className="bi bi-wifi me-1" />Remote</span>}
          {job.experience_required > 0 && <span className="detail-tag"><i className="bi bi-bar-chart me-1" />{job.experience_required}+ yrs exp</span>}
          {job.salary_min && (
            <span className="detail-tag text-success">
              <i className="bi bi-currency-dollar me-1" />
              {Number(job.salary_min).toLocaleString()} – {Number(job.salary_max).toLocaleString()}
            </span>
          )}
          {job.openings && <span className="detail-tag"><i className="bi bi-people me-1" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
          {job.application_deadline && (
            <span className="detail-tag text-danger">
              <i className="bi bi-calendar-x me-1" />Deadline: {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="row g-4 mt-2">
          <div className="col-lg-8">
            {job.description && (
              <>
                <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: '12px' }}>About the Role</h5>
                <p style={{ color: '#374151', lineHeight: '1.8' }}>{job.description}</p>
              </>
            )}
            {job.requirements && (
              <>
                <h5 style={{ fontWeight: 700, color: '#111827', margin: '24px 0 12px' }}>Requirements</h5>
                <p style={{ color: '#374151', lineHeight: '1.8' }}>{job.requirements}</p>
              </>
            )}
            {job.responsibilities && (
              <>
                <h5 style={{ fontWeight: 700, color: '#111827', margin: '24px 0 12px' }}>Responsibilities</h5>
                <p style={{ color: '#374151', lineHeight: '1.8' }}>{job.responsibilities}</p>
              </>
            )}
            {job.skills_required?.length > 0 && (
              <>
                <h5 style={{ fontWeight: 700, color: '#111827', margin: '24px 0 12px' }}>Skills Required</h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.skills_required.map(s => (
                    <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style={{ fontSize: '13px', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="col-lg-4">
            <div className="company-info-card">
              <h6 style={{ fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Company Info</h6>
              <dl className="mb-0">
                {job.industry && (<><dt style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry</dt><dd style={{ color: '#111827', fontWeight: 600, marginBottom: '12px' }}>{job.industry}</dd></>)}
                {job.company_size && (<><dt style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</dt><dd style={{ color: '#111827', fontWeight: 600, marginBottom: '12px' }}>{job.company_size}</dd></>)}
                {job.website && (<><dt style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</dt><dd style={{ marginBottom: '12px' }}><a href={job.website} target="_blank" rel="noreferrer" className="text-primary" style={{ fontWeight: 500 }}>{job.website}</a></dd></>)}
                {job.company_description && (<><dt style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</dt><dd style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{job.company_description?.slice(0, 200)}...</dd></>)}
              </dl>
            </div>
          </div>
        </div>
      </div>

     
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setStep(1); }}>
          <div className="modal-box" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <div>
                <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>Apply for {job.title}</h5>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{job.company_name} · Step {step} of {stepLabels.length}</p>
              </div>
              <button className="btn-icon" onClick={() => { setShowModal(false); setStep(1); }}><i className="bi bi-x-lg" /></button>
            </div>

            {/* Step progress */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 0 20px' }}>
              {stepLabels.map((label, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ height: 4, borderRadius: 2, background: step > i ? '#6366f1' : '#e5e7eb', marginBottom: 4 }} />
                  <div style={{ fontSize: 10, color: step > i ? '#6366f1' : '#9ca3af', textAlign: 'center', fontWeight: step === i + 1 ? 600 : 400 }}>{label}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleApply}>
            
              {step === 1 && (
                <div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input className="form-control" required value={form.full_name} onChange={setF('full_name')} placeholder="Your full name" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input type="email" className="form-control" required value={form.email} onChange={setF('email')} placeholder="you@email.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone *</label>
                      <input className="form-control" required value={form.phone} onChange={setF('phone')} placeholder="+91 98765 43210" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Current Location</label>
                      <input className="form-control" value={form.location} onChange={setF('location')} placeholder="City, State" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Availability</label>
                      <select className="form-select" value={form.availability} onChange={setF('availability')}>
                        <option value="">Select...</option>
                        <option value="immediately">Immediately</option>
                        <option value="2_weeks">Within 2 weeks</option>
                        <option value="1_month">Within 1 month</option>
                        <option value="3_months">Within 3 months</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Notice Period (days)</label>
                      <input type="number" className="form-control" value={form.notice_period} onChange={setF('notice_period')} placeholder="e.g. 30" min={0} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Expected Salary (per year)</label>
                      <input className="form-control" value={form.expected_salary} onChange={setF('expected_salary')} placeholder="e.g. ₹12,00,000" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold"><i className="bi bi-linkedin me-1 text-primary" />LinkedIn</label>
                      <input className="form-control" value={form.linkedin_url} onChange={setF('linkedin_url')} placeholder="linkedin.com/in/..." />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold"><i className="bi bi-github me-1" />GitHub</label>
                      <input className="form-control" value={form.github_url} onChange={setF('github_url')} placeholder="github.com/..." />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold"><i className="bi bi-globe me-1 text-success" />Portfolio</label>
                      <input className="form-control" value={form.portfolio_url} onChange={setF('portfolio_url')} placeholder="yoursite.com" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Cover Letter</label>
                      <textarea className="form-control" rows={4} placeholder="Tell them why you're the perfect fit..." value={form.cover_letter} onChange={setF('cover_letter')} />
                    </div>
                  </div>
                </div>
              )}


              {step === 2 && (
                <div>
                  {education.map((edu, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Education #{i + 1}</span>
                        {education.length > 1 && (
                          <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => removeEdu(i)}>
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Institution / University *</label>
                          <input className="form-control" value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="e.g. IIT Hyderabad" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Degree</label>
                          <select className="form-select" value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)}>
                            <option value="">Select degree</option>
                            <option>High School</option>
                            <option>Diploma</option>
                            <option>B.E. / B.Tech</option>
                            <option>B.Sc</option>
                            <option>BCA</option>
                            <option>BBA</option>
                            <option>M.E. / M.Tech</option>
                            <option>M.Sc</option>
                            <option>MCA</option>
                            <option>MBA</option>
                            <option>Ph.D</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Field of Study</label>
                          <input className="form-control" value={edu.field} onChange={e => setEdu(i, 'field', e.target.value)} placeholder="e.g. Computer Science" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Start Year</label>
                          <input type="number" className="form-control" value={edu.start_year} onChange={e => setEdu(i, 'start_year', e.target.value)} placeholder="2018" min={1980} max={2030} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">End Year</label>
                          <input type="number" className="form-control" value={edu.end_year} onChange={e => setEdu(i, 'end_year', e.target.value)} placeholder="2022" min={1980} max={2030} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Grade / CGPA</label>
                          <input className="form-control" value={edu.grade} onChange={e => setEdu(i, 'grade', e.target.value)} placeholder="e.g. 8.5 / 10" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={addEdu}>
                    <i className="bi bi-plus me-1" />Add Education
                  </button>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h6 style={{ fontWeight: 600, marginBottom: 12,color: '#111827' }}>Work Experience</h6>
                  {experience.map((exp, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Experience #{i + 1}</span>
                        {experience.length > 1 && (
                          <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => removeExp(i)}>
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Company</label>
                          <input className="form-control" value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} placeholder="Company name" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Role / Title</label>
                          <input className="form-control" value={exp.role} onChange={e => setExp(i, 'role', e.target.value)} placeholder="e.g. Software Engineer" />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label">Start Date</label>
                          <input type="month" className="form-control" value={exp.start} onChange={e => setExp(i, 'start', e.target.value)} />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label">End Date</label>
                          <input type="month" className="form-control" value={exp.end} onChange={e => setExp(i, 'end', e.target.value)} disabled={exp.current} />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <div className="form-check mb-2">
                            <input type="checkbox" className="form-check-input" id={`cur-${i}`} checked={exp.current} onChange={e => setExp(i, 'current', e.target.checked)} />
                            <label className="form-check-label small" htmlFor={`cur-${i}`}>Current</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Key Responsibilities</label>
                          <textarea className="form-control" rows={3} value={exp.description} onChange={e => setExp(i, 'description', e.target.value)} placeholder="Describe your key contributions and achievements..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline-primary rounded-pill btn-sm mb-4" onClick={addExp}>
                    <i className="bi bi-plus me-1" />Add Experience
                  </button>

                  <hr />
                  <h6 style={{ fontWeight: 600, margin: '16px 0 12px' ,color: '#111827'}}>Projects</h6>
                  {projects.map((prj, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Project #{i + 1}</span>
                        {projects.length > 1 && (
                          <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => removePrj(i)}>
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Project Name</label>
                          <input className="form-control" value={prj.name} onChange={e => setPrj(i, 'name', e.target.value)} placeholder="e.g. E-commerce Platform" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Live URL / GitHub</label>
                          <input className="form-control" value={prj.url} onChange={e => setPrj(i, 'url', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Tech Stack</label>
                          <input className="form-control" value={prj.tech} onChange={e => setPrj(i, 'tech', e.target.value)} placeholder="React, Node.js, PostgreSQL..." />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" rows={2} value={prj.description} onChange={e => setPrj(i, 'description', e.target.value)} placeholder="What did you build and what problem did it solve?" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={addPrj}>
                    <i className="bi bi-plus me-1" />Add Project
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Skills <span className="text-muted small">(comma separated)</span></label>
                    <input className="form-control" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Node.js, Python, SQL..." />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {skillsInput.split(',').filter(s => s.trim()).map(s => (
                        <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Certifications <span className="text-muted small">(comma separated)</span></label>
                    <input className="form-control" value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="AWS Certified, Google UX Design, Meta Front-End..." />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Resume (PDF/DOC)</label>
                    <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
                    <div className="form-text">Leave empty to use your profile resume.</div>
                  </div>
                  <div className="col-12">
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#166534', marginBottom: 8 }}>
                        <i className="bi bi-check-circle-fill me-2" />Review before submitting
                      </div>
                      <div style={{ fontSize: 13, color: '#374151' }}>
                        <strong>Role:</strong> {job.title} at {job.company_name}<br />
                        <strong>Applicant:</strong> {form.full_name || '—'} · {form.email || '—'}<br />
                        <strong>Education entries:</strong> {education.filter(e => e.institution).length}<br />
                        <strong>Experience entries:</strong> {experience.filter(e => e.company).length}<br />
                        <strong>Projects:</strong> {projects.filter(p => p.name).length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            
              <div className="d-flex gap-2 mt-4">
                {step > 1 && (
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setStep(s => s - 1)}>
                    <i className="bi bi-arrow-left me-2" />Back
                  </button>
                )}
                {step < stepLabels.length ? (
                  <button type="button" className="btn btn-primary rounded-pill px-4 ms-auto" onClick={() => setStep(s => s + 1)}>
                    Next <i className="bi bi-arrow-right ms-2" />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary rounded-pill px-4 ms-auto" disabled={applying}>
                    {applying ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;