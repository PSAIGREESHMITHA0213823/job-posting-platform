// import React, { useState, useEffect, useCallback } from 'react';
// import { createPortal } from 'react-dom';
// import { adminApi } from '../api/admin';
// import { Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
// import DataTable from '../components/DataTable';

// const defaultForm = { company_id: '', plan_id: '', amount: '', status: 'pending', transaction_id: '' };

// export default function Payments() {
//   const [payments, setPayments] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [search, setSearch] = useState('');
//   const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
//   const [total, setTotal] = useState(0);
//   const [modal, setModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(defaultForm);

//   // ✅ FIX 1: Wrapped in useCallback with [filters] dependency to avoid stale closure
//   const fetchPayments = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await adminApi.getPayments(filters);
//       if (res.data.success) {
//         setPayments(res.data.data);
//         // ✅ FIX 2: Safely read total from multiple possible API response shapes
//         const count =
//           res.data.total ??
//           res.data.count ??
//           res.data.pagination?.total ??
//           res.data.data?.length ??
//           0;
//         setTotal(count);
//       } else {
//         setError('Failed to load payments.');
//       }
//     } catch {
//       setError('Failed to load payments.');
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]); // ✅ re-created whenever filters change

//   // ✅ FIX 3: Depend on fetchPayments (not filters directly) so it always uses latest
//   useEffect(() => { fetchPayments(); }, [fetchPayments]);

//   useEffect(() => { fetchCompanies(); fetchPlans(); }, []);

//   // Debounced search → updates filters
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setFilters(f => ({ ...f, search: search.trim(), page: 1 }));
//     }, 350);
//     return () => clearTimeout(t);
//   }, [search]);

//   const fetchCompanies = async () => {
//     try {
//       const res = await adminApi.getCompanies({ limit: 999 });
//       if (res.data.success) setCompanies(res.data.data);
//     } catch (err) { console.warn('Could not load companies', err); }
//   };

//   const fetchPlans = async () => {
//     try {
//       const res = await adminApi.getPlans();
//       if (res.data.success) setPlans(res.data.data);
//     } catch (err) { console.warn('Could not load plans', err); }
//   };

//   const handleDelete = async id => {
//     if (!window.confirm('Delete this payment record?')) return;
//     try { await adminApi.deletePayment(id); fetchPayments(); }
//     catch { alert('Delete failed.'); }
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       if (editing) {
//         await adminApi.updatePayment(editing.id, form);
//       } else {
//         await adminApi.createPayment(form);
//       }
//       closeModal();
//       fetchPayments();
//     } catch {
//       alert(editing ? 'Update failed' : 'Creation failed');
//     }
//   };

//   const openEditModal = row => {
//     setEditing(row);
//     setForm({
//       company_id: row.company_id,
//       plan_id: row.plan_id,
//       amount: row.amount,
//       status: row.status,
//       transaction_id: row.transaction_id || '',
//     });
//     setModal(true);
//   };

//   const openAddModal = () => {
//     setEditing(null);
//     setForm({ ...defaultForm });
//     setModal(true);
//   };

//   const closeModal = () => {
//     setModal(false);
//     setEditing(null);
//     setForm({ ...defaultForm });
//   };

//   const clearFilters = () => {
//     setSearch('');
//     setFilters({ page: 1, limit: 20, search: '' });
//   };

//   const statusTag = status => {
//     if (status === 'completed') return <span className="tag tag-green">completed</span>;
//     if (status === 'pending')   return <span className="tag tag-amber">pending</span>;
//     return <span className="tag tag-red">failed</span>;
//   };

//   const columns = [
//     { header: 'Company', accessor: 'company_name' },
//     { header: 'Plan', accessor: 'plan_name', render: v => <span className="tag tag-gray">{v}</span> },
//     { header: 'Amount', accessor: 'amount', render: v => <span style={{ fontFamily: 'var(--mono)' }}>${parseFloat(v || 0).toLocaleString()}</span> },
//     { header: 'Status', accessor: 'status', render: statusTag },
//     { header: 'Date', accessor: 'created_at', render: v => new Date(v).toLocaleDateString() },
//     {
//       header: 'Actions', accessor: 'id',
//       render: (id, row) => (
//         <div className="actions">
//           <button className="btn-icon blue" onClick={() => openEditModal(row)}><Edit2 size={14} /></button>
//           <button className="btn-icon red" onClick={() => handleDelete(id)}><Trash2 size={14} /></button>
//         </div>
//       ),
//     },
//   ];

//   const modalPortal = modal ? createPortal(
//     <div
//       onClick={closeModal}
//       style={{
//         position: 'fixed', inset: 0,
//         background: 'rgba(0,0,0,0.65)',
//         backdropFilter: 'blur(3px)',
//         zIndex: 9999,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         padding: '20px',
//       }}
//     >
//       <div
//         onClick={e => e.stopPropagation()}
//         style={{
//           background: '#16161e', border: '1px solid #2a2a38',
//           borderRadius: '14px', padding: '26px 28px',
//           width: '100%', maxWidth: '500px',
//           maxHeight: '90vh', overflowY: 'auto',
//           position: 'relative', zIndex: 10000,
//         }}
//       >
//         <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 20 }}>
//           {editing ? 'Edit Payment' : 'New Payment'}
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Company</label>
//             <select value={form.company_id}
//               onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} required>
//               <option value="">Select company...</option>
//               {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>
//           </div>
//           <div className="form-row">
//             <div className="form-group">
//               <label>Plan</label>
//               <select value={form.plan_id}
//                 onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))} required>
//                 <option value="">Select plan...</option>
//                 {plans.map(p => (
//                   <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Amount ($)</label>
//               <input type="number" step="0.01" min="0"
//                 value={form.amount}
//                 onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
//             </div>
//           </div>
//           <div className="form-group">
//             <label>Status</label>
//             <select value={form.status}
//               onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
//               <option value="pending">Pending</option>
//               <option value="completed">Completed</option>
//               <option value="failed">Failed</option>
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Transaction ID</label>
//             <input type="text" value={form.transaction_id}
//               onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))}
//               placeholder="txn_..." />
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
//             <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
//           </div>
//         </form>
//       </div>
//     </div>,
//     document.body
//   ) : null;

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <div className="page-title">Payments</div>
//           {/* ✅ FIX 4: Shows total count correctly now */}
//           <div className="page-sub">{total} records</div>
//         </div>
//         <button className="btn btn-primary" onClick={openAddModal}>
//           <Plus size={14} /> Add Payment
//         </button>
//       </div>

//       {error && (
//         <div className="alert alert-error">
//           {error}
//           <button className="btn-icon red" onClick={fetchPayments}><RefreshCw size={13} /></button>
//         </div>
//       )}

//       <div className="filters">
//         <input
//           type="text"
//           placeholder="Search by company or transaction..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         <button className="btn btn-ghost" onClick={clearFilters}>Clear</button>
//       </div>

//       <div className="tbl-wrap">
//         <DataTable
//           columns={columns}
//           data={payments}
//           loading={loading}
//           currentPage={filters.page}
//           totalPages={Math.ceil(total / filters.limit)}
//           onPageChange={page => setFilters(f => ({ ...f, page }))}
//         />
//       </div>

//       {modalPortal}
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../api/admin';
import { Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';

const defaultForm = { company_id: '', plan_id: '', amount: '', status: 'pending', transaction_id: '' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  // ✅ Same pattern as Users — fetch on every filter change
  useEffect(() => { fetchPayments(); }, [filters]);

  useEffect(() => { fetchCompanies(); fetchPlans(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getPayments(filters);
      if (res.data.success) {
        setPayments(res.data.data);
        // ✅ Safely handle different API response shapes for total
        const count =
          res.data.total ??
          res.data.count ??
          res.data.pagination?.total ??
          res.data.data?.length ??
          0;
        setTotal(count);
      } else {
        setError('Failed to load payments.');
      }
    } catch {
      setError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await adminApi.getCompanies({ limit: 999 });
      if (res.data.success) setCompanies(res.data.data);
    } catch (err) { console.warn('Could not load companies', err); }
  };

  const fetchPlans = async () => {
    try {
      const res = await adminApi.getPlans();
      if (res.data.success) setPlans(res.data.data);
    } catch (err) { console.warn('Could not load plans', err); }
  };

  // ✅ Same as Users — directly update filters (no separate search state, no debounce)
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const handleDelete = async id => {
    if (!window.confirm('Delete this payment record?')) return;
    try { await adminApi.deletePayment(id); fetchPayments(); }
    catch { alert('Delete failed.'); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.updatePayment(editing.id, form);
      } else {
        await adminApi.createPayment(form);
      }
      closeModal();
      fetchPayments();
    } catch {
      alert(editing ? 'Update failed' : 'Creation failed');
    }
  };

  const openEditModal = row => {
    setEditing(row);
    setForm({
      company_id: row.company_id,
      plan_id: row.plan_id,
      amount: row.amount,
      status: row.status,
      transaction_id: row.transaction_id || '',
    });
    setModal(true);
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm({ ...defaultForm });
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20, search: '' });
  };

  const statusTag = status => {
    if (status === 'completed') return <span className="tag tag-green">completed</span>;
    if (status === 'pending')   return <span className="tag tag-amber">pending</span>;
    return <span className="tag tag-red">failed</span>;
  };

  const columns = [
    { header: 'Company', accessor: 'company_name' },
    { header: 'Plan', accessor: 'plan_name', render: v => <span className="tag tag-gray">{v}</span> },
    { header: 'Amount', accessor: 'amount', render: v => <span style={{ fontFamily: 'var(--mono)' }}>${parseFloat(v || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: statusTag },
    { header: 'Date', accessor: 'created_at', render: v => new Date(v).toLocaleDateString() },
    {
      header: 'Actions', accessor: 'id',
      render: (id, row) => (
        <div className="actions">
          <button className="btn-icon blue" onClick={() => openEditModal(row)}><Edit2 size={14} /></button>
          <button className="btn-icon red" onClick={() => handleDelete(id)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const modalPortal = modal ? createPortal(
    <div
      onClick={closeModal}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#16161e', border: '1px solid #2a2a38',
          borderRadius: '14px', padding: '26px 28px',
          width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflowY: 'auto',
          position: 'relative', zIndex: 10000,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 20 }}>
          {editing ? 'Edit Payment' : 'New Payment'}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company</label>
            <select value={form.company_id}
              onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} required>
              <option value="">Select company...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Plan</label>
              <select value={form.plan_id}
                onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))} required>
                <option value="">Select plan...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" step="0.01" min="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Transaction ID</label>
            <input type="text" value={form.transaction_id}
              onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))}
              placeholder="txn_..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">{total} records</div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={14} /> Add Payment
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn-icon red" onClick={fetchPayments}><RefreshCw size={13} /></button>
        </div>
      )}

      {/* ✅ Same pattern as Users — onChange directly calls setF, no separate state */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by company or transaction..."
          value={filters.search}
          onChange={e => setF('search', e.target.value)}
        />
        <button className="btn btn-ghost" onClick={clearFilters}>Clear</button>
      </div>

      <div className="tbl-wrap">
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          currentPage={filters.page}
          totalPages={Math.ceil(total / filters.limit)}
          onPageChange={page => setFilters(f => ({ ...f, page }))}
        />
      </div>

      {modalPortal}
    </div>
  );
}