import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register(form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <i className="bi bi-lightning-charge-fill text-warning me-2 fs-4" />
          <span className="fs-4 fw-bold">JobPortal</span>
        </div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Start your job search journey</p>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">Full Name</label>
            <input className="form-control" placeholder="John Doe" value={form.full_name} onChange={set('full_name')} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input type="email" className="form-control" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Phone (optional)</label>
            <input className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium">Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-lg w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-3 text-muted small">
          Already have an account? <Link to="/login" className="text-primary fw-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;