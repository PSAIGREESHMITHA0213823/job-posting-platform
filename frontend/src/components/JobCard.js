
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveJob } from '../services/api';

const typeBadge = { full_time: 'success', part_time: 'warning', contract: 'info', internship: 'secondary' };

const JobCard = ({ job, saved = false, onSaveToggle }) => {
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveJob(job.id);
      setIsSaved(res.saved);
      onSaveToggle && onSaveToggle(job.id, res.saved);
    } catch {}
    setSaving(false);
  };

  const badgeColor = typeBadge[job.employment_type] || 'secondary';

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="company-logo-wrap">
          {job.logo_url
            ? <img src={'http://localhost:5000' + job.logo_url} alt={job.company_name} className="company-logo" />
            : <div className="company-logo-placeholder">{job.company_name?.[0]}</div>}
        </div>
        <button className={'btn-icon save-btn' + (isSaved ? ' saved' : '')} onClick={handleSave} disabled={saving}>
          <i className={'bi ' + (isSaved ? 'bi-bookmark-fill' : 'bi-bookmark')} />
        </button>
      </div>
      <div className="company-name-row">
        <span className="company-name">{job.company_name}</span>
        {job.company_verified && <i className="bi bi-patch-check-fill text-primary ms-1" />}
      </div>
      <Link to={'/dashboard/jobs/' + job.id} className="job-title-link">
        <h6 className="job-title">{job.title}</h6>
      </Link>
      <div className="job-tags">
        <span className={'badge text-' + badgeColor + ' bg-' + badgeColor + '-subtle border border-' + badgeColor + '-subtle'}>
          {(job.employment_type || '').replace('_', ' ')}
        </span>
        {job.is_remote && <span className="badge text-info bg-info-subtle border border-info-subtle">Remote</span>}
        {job.location && (
          <span className="badge text-muted bg-light border">
            <i className="bi bi-geo-alt me-1" />{job.location}
          </span>
        )}
      </div>
      <div className="job-salary">
        {job.salary_min
          ? (job.salary_currency || '$') + Number(job.salary_min).toLocaleString() + ' – ' + Number(job.salary_max).toLocaleString()
          : 'Salary not disclosed'}
      </div>
      <div className="job-footer">
        <span className="text-muted small"><i className="bi bi-people me-1" />{job.application_count || 0} applied</span>
        <Link to={'/dashboard/jobs/' + job.id} className="btn btn-sm btn-primary rounded-pill px-3">View</Link>
      </div>
    </div>
  );
};

export default JobCard;