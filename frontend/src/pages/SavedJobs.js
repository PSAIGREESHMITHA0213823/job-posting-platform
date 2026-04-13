
import React, { useEffect, useState } from 'react';
import { getSavedJobs } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedJobs().then(d => setJobs(d.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (id, saved) => {
    if (!saved) setJobs(prev => prev.filter(j => j.id !== id));
  };

  if (loading) return <LoadingSpinner text="Loading saved jobs..." />;

  return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1" style={{ color: 'black' }}>Saved Jobs</h4>
        <p className="text-muted mb-0">{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
      </div>
      {jobs.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bookmark-x fs-1 text-muted" />
          <p className="text-muted mt-2">No saved jobs yet. Bookmark jobs to see them here.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => <JobCard key={job.id} job={job} saved onSaveToggle={handleSaveToggle} />)}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;