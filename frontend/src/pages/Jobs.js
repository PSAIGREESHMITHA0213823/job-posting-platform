// import React, { useState, useEffect, useCallback } from 'react';
// import { browseJobs, getSavedJobs } from '../services/api';
// import JobCard from '../components/JobCard';
// import LoadingSpinner from '../components/LoadingSpinner';

// const employmentTypes = ['full_time', 'part_time', 'contract', 'internship'];

// const Jobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [savedIds, setSavedIds] = useState(new Set());
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({ search: '', employment_type: '', is_remote: '', salary_min: '', experience: '' });

//   const fetchJobs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
//       const data = await browseJobs(params);
//       setJobs(data.data || []);
//       setTotal(data.total || 0);
//     } catch {}
//     setLoading(false);
//   }, [page, filters]);

//   useEffect(() => { fetchJobs(); }, [fetchJobs]);

//   useEffect(() => {
//     getSavedJobs().then(d => setSavedIds(new Set((d.data || []).map(j => j.id)))).catch(() => {});
//   }, []);

//   const handleFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
//   const handleSaveToggle = (id, saved) => {
//     setSavedIds(prev => { const next = new Set(prev); saved ? next.add(id) : next.delete(id); return next; });
//   };

//   const totalPages = Math.ceil(total / 12);

//   return (
//     <div className="page-content">
//       <div className="page-hero">
//         <h4 className="mb-1">Browse Jobs</h4>
//         <p className="text-muted mb-0">{total.toLocaleString()} opportunities available</p>
//       </div>

//       <div className="filter-bar">
//         <div className="filter-search">
//           <i className="bi bi-search text-muted" />
//           <input
//             className="filter-input"
//             placeholder="Search jobs, companies..."
//             value={filters.search}
//             onChange={e => handleFilter('search', e.target.value)}
//           />
//         </div>
//         <select className="form-select filter-select" value={filters.employment_type} onChange={e => handleFilter('employment_type', e.target.value)}>
//           <option value="">All Types</option>
//           {employmentTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
//         </select>
//         <select className="form-select filter-select" value={filters.is_remote} onChange={e => handleFilter('is_remote', e.target.value)}>
//           <option value="">On-site & Remote</option>
//           <option value="true">Remote Only</option>
//         </select>
//         <select className="form-select filter-select" value={filters.experience} onChange={e => handleFilter('experience', e.target.value)}>
//           <option value="">Any Experience</option>
//           <option value="0">Fresher</option>
//           <option value="2">Up to 2 yrs</option>
//           <option value="5">Up to 5 yrs</option>
//         </select>
//         <button className="btn btn-outline-secondary rounded-pill" onClick={() => { setFilters({ search: '', employment_type: '', is_remote: '', salary_min: '', experience: '' }); setPage(1); }}>
//           <i className="bi bi-x-circle me-1" />Clear
//         </button>
//       </div>

//       {loading ? <LoadingSpinner text="Finding jobs..." /> : jobs.length === 0 ? (
//         <div className="empty-state">
//           <i className="bi bi-briefcase fs-1 text-muted" />
//           <p className="text-muted mt-2">No jobs found. Try different filters.</p>
//         </div>
//       ) : (
//         <>
//           <div className="jobs-grid">
//             {jobs.map(job => (
//               <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onSaveToggle={handleSaveToggle} />
//             ))}
//           </div>
//           {totalPages > 1 && (
//             <div className="pagination-wrap">
//               <nav>
//                 <ul className="pagination mb-0">
//                   <li className={'page-item' + (page === 1 ? ' disabled' : '')}>
//                     <button className="page-link" onClick={() => setPage(p => p - 1)}>
//                       <i className="bi bi-chevron-left" />
//                     </button>
//                   </li>
//                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                     const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
//                     return p <= totalPages ? (
//                       <li key={p} className={'page-item' + (p === page ? ' active' : '')}>
//                         <button className="page-link" onClick={() => setPage(p)}>{p}</button>
//                       </li>
//                     ) : null;
//                   })}
//                   <li className={'page-item' + (page === totalPages ? ' disabled' : '')}>
//                     <button className="page-link" onClick={() => setPage(p => p + 1)}>
//                       <i className="bi bi-chevron-right" />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Jobs;
import React, { useState, useEffect, useCallback } from 'react';
import { browseJobs, getSavedJobs } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const employmentTypes = ['full_time', 'part_time', 'contract', 'internship'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', employment_type: '', is_remote: '', salary_min: '', experience: '' });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const data = await browseJobs(params);
      setJobs(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    getSavedJobs().then(d => setSavedIds(new Set((d.data || []).map(j => j.id)))).catch(() => {});
  }, []);

  const handleFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const handleSaveToggle = (id, saved) => {
    setSavedIds(prev => { const next = new Set(prev); saved ? next.add(id) : next.delete(id); return next; });
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="page-content">
      <div className="page-hero">
       <h4 className="mb-1" style={{ color: 'black' }}>Browse Jobs</h4>
        <p className="text-muted mb-0">{total.toLocaleString()} opportunities available</p>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <i className="bi bi-search text-muted" />
          <input
            className="filter-input"
            placeholder="Search jobs, companies..."
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
        </div>
        <select className="form-select filter-select" value={filters.employment_type} onChange={e => handleFilter('employment_type', e.target.value)}>
          <option value="">All Types</option>
          {employmentTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <select className="form-select filter-select" value={filters.is_remote} onChange={e => handleFilter('is_remote', e.target.value)}>
          <option value="">On-site & Remote</option>
          <option value="true">Remote Only</option>
        </select>
        <select className="form-select filter-select" value={filters.experience} onChange={e => handleFilter('experience', e.target.value)}>
          <option value="">Any Experience</option>
          <option value="0">Fresher</option>
          <option value="2">Up to 2 yrs</option>
          <option value="5">Up to 5 yrs</option>
        </select>
        <button className="btn btn-outline-secondary rounded-pill" onClick={() => { setFilters({ search: '', employment_type: '', is_remote: '', salary_min: '', experience: '' }); setPage(1); }}>
          <i className="bi bi-x-circle me-1" />Clear
        </button>
      </div>

      {loading ? <LoadingSpinner text="Finding jobs..." /> : jobs.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-briefcase fs-1 text-muted" />
          <p className="text-muted mt-2">No jobs found. Try different filters.</p>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onSaveToggle={handleSaveToggle} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination-wrap">
              <nav>
                <ul className="pagination mb-0">
                  <li className={'page-item' + (page === 1 ? ' disabled' : '')}>
                    <button className="page-link" onClick={() => setPage(p => p - 1)}>
                      <i className="bi bi-chevron-left" />
                    </button>
                  </li>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return p <= totalPages ? (
                      <li key={p} className={'page-item' + (p === page ? ' active' : '')}>
                        <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                      </li>
                    ) : null;
                  })}
                  <li className={'page-item' + (page === totalPages ? ' disabled' : '')}>
                    <button className="page-link" onClick={() => setPage(p => p + 1)}>
                      <i className="bi bi-chevron-right" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;