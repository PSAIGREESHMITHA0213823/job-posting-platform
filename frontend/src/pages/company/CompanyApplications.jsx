import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const statusColors = {
  pending:     { bg: '#fef3c7', color: '#92400e' },
  shortlisted: { bg: '#dbeafe', color: '#1e40af' },
  hired:       { bg: '#d1fae5', color: '#065f46' },
  rejected:    { bg: '#fee2e2', color: '#991b1b' },
};

const CompanyApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  // Load jobs
  useEffect(() => {
    axios.get(`${API}/company/jobs`, getAuth())
      .then(res => {
        const list = res.data.data || [];
        setJobs(list);
        if (list.length) setSelectedJob(list[0].id);
      });
  }, []);

  // Load applicants
  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);

    axios.get(`${API}/company/jobs/${selectedJob}/applicants`, getAuth())
      .then(res => setApplicants(res.data.data || []))
      .finally(() => setLoading(false));

  }, [selectedJob]);

  return (
    <div style={{ padding: 24 }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Applications</h2>
        <p style={{ color: '#6b7280' }}>Manage candidates</p>
      </div>

      {/* JOB SELECT */}
      <select
        value={selectedJob}
        onChange={e => setSelectedJob(e.target.value)}
        style={select}
      >
        {jobs.map(j => (
          <option key={j.id} value={j.id}>{j.title}</option>
        ))}
      </select>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>

        {/* LEFT LIST */}
        <div style={card}>
          {loading ? (
            <div style={center}>Loading...</div>
          ) : applicants.length === 0 ? (
            <div style={center}>No applications</div>
          ) : applicants.map(app => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              style={{
                padding: 16,
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selectedApp?.id === app.id ? '#f0f3ff' : '#fff'
              }}
            >
              <div style={{ fontWeight: 600 }}>{app.full_name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{app.email}</div>

              <span style={badge(app.status)}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
        {selectedApp && (
          <div style={sidePanel}>
            <h3>{selectedApp.full_name}</h3>

            <p><b>Email:</b> {selectedApp.email}</p>
            <p><b>Status:</b> {selectedApp.status}</p>

            {selectedApp.skills && (
              <div>
                <b>Skills:</b>
                <div style={{ marginTop: 6 }}>
                  {selectedApp.skills.map((s, i) => (
                    <span key={i} style={chip}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedApp.profile_resume && (
              <a
                href={`http://localhost:5000${selectedApp.profile_resume}`}
                target="_blank"
                rel="noreferrer"
                style={resumeBtn}
              >
                View Resume
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompanyApplications;

const card = {
  flex: 1,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  overflow: 'hidden'
};

const sidePanel = {
  width: 300,
  background: '#fff',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
};

const select = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #e5e7eb'
};

const badge = (status) => ({
  display: 'inline-block',
  marginTop: 8,
  padding: '4px 10px',
  borderRadius: 20,
  fontSize: 12,
  background: statusColors[status]?.bg,
  color: statusColors[status]?.color
});

const chip = {
  padding: '4px 8px',
  background: '#eef2ff',
  marginRight: 6,
  borderRadius: 10,
  fontSize: 12
};

const resumeBtn = {
  display: 'block',
  marginTop: 16,
  padding: 10,
  background: '#4f6ef7',
  color: '#fff',
  textAlign: 'center',
  borderRadius: 8,
  textDecoration: 'none'
};

const center = {
  padding: 40,
  textAlign: 'center',
  color: '#9ca3af'
};