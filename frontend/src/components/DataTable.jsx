
import React from 'react';

const DataTable = ({ columns, data, loading, onPageChange, currentPage, totalPages }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '52px 0', gap: 10,
      }}>
        <div style={{ fontSize: 28, opacity: .35 }}>📭</div>
        <div style={{ fontSize: 13.5, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>No records found</div>
      </div>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="dt-th">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="dt-tr">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="dt-td">
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="dt-footer">
          <span className="dt-page-info">Page {currentPage} of {totalPages}</span>
          <div className="dt-pagination">
            <button
              className="dt-pg-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {pages.map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="dt-pg-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`dt-pg-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="dt-pg-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;