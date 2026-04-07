import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDetail, applyToJob } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    getJobDetail(id).then(d => setJob(d.data)).catch(() => setJob(null)).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('job_id', id);
      if (coverLetter) fd.append('cover_letter', coverLetter);
      if (resume) fd.append('resume', resume);
      await applyToJob(fd);
      setMessage('Application submitted successfully!');
      setMsgType('success');
      setShowModal(false);
    } catch (err) {
      setMessage(err.message || 'Application failed');
      setMsgType('danger');
    }
    setApplying(false);
  };

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div className="page-content"><div className="alert alert-warning">Job not found.</div></div>;

  return (
    <div className="page-content">
      <button className="btn btn-sm btn-outline-secondary rounded-pill mb-4" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2" />Back
      </button>

      {message && <div className={'alert alert-' + msgType + ' d-flex align-items-center gap-2'}>
        <i className={'bi bi-' + (msgType === 'success' ? 'check-circle' : 'exclamation-circle')} />
        {message}
      </div>}

      <div className="job-detail-card">
        <div className="job-detail-header">
          <div className="d-flex align-items-start gap-3">
            {job.logo_url
              ? <img src={'http://localhost:5000' + job.logo_url} alt={job.company_name} className="detail-logo" />
              : <div className="detail-logo-placeholder">{job.company_name?.[0]}</div>}
            <div>
              <h3 className="fw-bold mb-1">{job.title}</h3>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted fw-medium">{job.company_name}</span>
                {job.company_verified && <i className="bi bi-patch-check-fill text-primary" />}
                {job.city && <span className="text-muted small"><i className="bi bi-geo-alt me-1" />{job.city}, {job.country}</span>}
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
          {job.salary_min && <span className="detail-tag text-success"><i className="bi bi-currency-dollar me-1" />{Number(job.salary_min).toLocaleString()} – {Number(job.salary_max).toLocaleString()}</span>}
          {job.openings && <span className="detail-tag"><i className="bi bi-people me-1" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
          {job.application_deadline && <span className="detail-tag text-danger"><i className="bi bi-calendar-x me-1" />Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>}
        </div>

        <div className="row g-4 mt-2">
          <div className="col-lg-8">
            {job.description && (<>
              <h5 className="fw-semibold mb-3">About the Role</h5>
              <p className="text-muted lh-lg">{job.description}</p>
            </>)}
            {job.requirements && (<>
              <h5 className="fw-semibold mb-3 mt-4">Requirements</h5>
              <p className="text-muted lh-lg">{job.requirements}</p>
            </>)}
            {job.responsibilities && (<>
              <h5 className="fw-semibold mb-3 mt-4">Responsibilities</h5>
              <p className="text-muted lh-lg">{job.responsibilities}</p>
            </>)}
            {job.skills_required?.length > 0 && (<>
              <h5 className="fw-semibold mb-3 mt-4">Skills Required</h5>
              <div className="d-flex flex-wrap gap-2">
                {job.skills_required.map(s => <span key={s} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{s}</span>)}
              </div>
            </>)}
          </div>
          <div className="col-lg-4">
            <div className="company-info-card">
              <h6 className="fw-bold mb-3">Company Info</h6>
              <dl className="mb-0">
                {job.industry && <><dt className="text-muted small">Industry</dt><dd className="fw-medium mb-2">{job.industry}</dd></>}
                {job.company_size && <><dt className="text-muted small">Size</dt><dd className="fw-medium mb-2">{job.company_size}</dd></>}
                {job.website && <><dt className="text-muted small">Website</dt><dd className="mb-2"><a href={job.website} target="_blank" rel="noreferrer" className="text-primary">{job.website}</a></dd></>}
                {job.company_description && <><dt className="text-muted small">About</dt><dd className="text-muted small mb-0">{job.company_description?.slice(0, 200)}...</dd></>}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h5 className="fw-bold mb-0">Apply for {job.title}</h5>
              <button className="btn-icon" onClick={() => setShowModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label fw-medium">Cover Letter</label>
                <textarea className="form-control" rows={5} placeholder="Tell them why you're a great fit..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium">Resume (PDF/DOC)</label>
                <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
                <div className="form-text">Leave empty to use your profile resume.</div>
              </div>
              <button type="submit" className="btn btn-primary w-100 rounded-pill" disabled={applying}>
                {applying ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;