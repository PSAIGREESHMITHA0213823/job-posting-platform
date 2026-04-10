
// import React from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// export default function DataTable({ columns, data, loading, currentPage, totalPages, onPageChange }) {
//   if (loading) {
//     return (
//       <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
//         <div className="spinner" />
//       </div>
//     );
//   }

//   if (!data.length) {
//     return (
//       <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13 }}>
//         no records found
//       </div>
//     );
//   }

//   return (
//     <>
//       <div style={{ overflowX: 'auto' }}>
//         <table className="tbl">
//           <thead>
//             <tr>
//               {columns.map(c => <th key={c.header}>{c.header}</th>)}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, i) => (
//               <tr key={i}>
//                 {columns.map(c => (
//                   <td key={c.header}>
//                     {c.render ? c.render(row[c.accessor], row) : (row[c.accessor] ?? '—')}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="tbl-footer">
//           <span className="tbl-count">page {currentPage} of {totalPages}</span>
//           <div className="pagination">
//             <button className="pg-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
//               <ChevronLeft size={13} />
//             </button>
//             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//               const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
//               if (p < 1 || p > totalPages) return null;
//               return (
//                 <button key={p} className={`pg-btn ${p === currentPage ? 'active' : ''}`} onClick={() => onPageChange(p)}>
//                   {p}
//                 </button>
//               );
//             })}
//             <button className="pg-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
//               <ChevronRight size={13} />
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React from 'react';

const DataTable = ({ columns, data, loading, onPageChange, currentPage, totalPages }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="mb-0">No records found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-3 fw-semibold text-muted small text-uppercase">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-3 py-3">
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : row[col.accessor] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
          <span className="text-muted small">
            Page {currentPage} of {totalPages}
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                  &laquo;
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <li key={`ellipsis-${i}`} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  ) : (
                    <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => onPageChange(p)}>
                        {p}
                      </button>
                    </li>
                  )
                )}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default DataTable;