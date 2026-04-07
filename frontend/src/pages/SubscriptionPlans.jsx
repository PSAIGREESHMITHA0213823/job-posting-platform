import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Pencil, Trash2, Plus } from 'lucide-react';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', duration_days: '', features: '' });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getPlans();
      if (response.data.success) setPlans(response.data.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, form);
      } else {
        await adminApi.createPlan(form);
      }
      setShowForm(false);
      setEditingPlan(null);
      setForm({ name: '', price: '', duration_days: '', features: '' });
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, price: plan.price, duration_days: plan.duration_days, features: plan.features || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await adminApi.deletePlan(id);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Subscription Plans</h1>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => { setShowForm(true); setEditingPlan(null); }}>
          <Plus size={18} /> Add Plan
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">{editingPlan ? 'Edit Plan' : 'New Plan'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <input className="form-control" placeholder="Plan Name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="number" placeholder="Price ($)" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="number" placeholder="Duration (days)" value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value })} required />
                </div>
                <div className="col-md-3 d-flex gap-2">
                  <button type="submit" className="btn btn-success flex-grow-1">Save</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
                <div className="col-12">
                  <textarea className="form-control" placeholder="Features (one per line)" rows={3}
                    value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3">
        {plans.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No plans found.</div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{plan.name}</h5>
                      <span className="text-muted small">{plan.duration_days} days</span>
                    </div>
                    <div className="fs-4 fw-bold text-primary">${plan.price}</div>
                  </div>
                  {plan.features && (
                    <ul className="small text-muted ps-3">
                      {String(plan.features).split('\n').filter(Boolean).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="card-footer bg-white border-0 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => handleEdit(plan)}>
                    <Pencil size={14} className="me-1" /> Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => handleDelete(plan.id)}>
                    <Trash2 size={14} className="me-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;