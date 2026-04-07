import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from "../assets/register.jpg";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('employee');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_name: '',
    industry: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        role === 'company_manager'
          ? '/api/auth/register/company'
          : '/api/auth/register/employee';

      const payload =
        role === 'company_manager'
          ? {
              email: form.email,
              password: form.password,
              full_name: form.full_name,
              phone: form.phone,
              company_name: form.company_name,
              industry: form.industry,
            }
          : {
              email: form.email,
              password: form.password,
              full_name: form.full_name,
              phone: form.phone,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);

      if (data.user.role === 'company_manager') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid p-0"
      style={{
        background: 'linear-gradient(120deg, #0F172A, #1E293B)',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Ubuntu', sans-serif"
      }}
    >
      <div className="row h-100 m-0">
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '25px',
              borderRadius: '18px',
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#E2E8F0',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div className="text-center mb-3">
              <h2 style={{ color: '#6366F1', fontWeight: '900', fontSize: "40px" }}>
                JobPortal
              </h2>
              <p style={{ color: '#94A3B8' }}>
                Create your account 🚀
              </p>
            </div>
            <div className="btn-group w-100 mb-3">
              <button
                type="button"
                className={`btn ${role === 'employee' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setRole('employee')}
              >
                Job Seeker
              </button>

              <button
                type="button"
                className={`btn ${role === 'company_manager' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setRole('company_manager')}
              >
                Company
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-1">
                <label className="small">Full Name</label>
                <input
                  className="form-control"
                  value={form.full_name}
                  onChange={set('full_name')}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-1">
                <label className="small">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={set('email')}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-1">
                <label className="small">Phone</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={set('phone')}
                  style={inputStyle}
                />
              </div>

              {role === 'company_manager' && (
                <>
                  <div className="mb-1">
                    <label className="small">Company Name</label>
                    <input
                      className="form-control"
                      value={form.company_name}
                      onChange={set('company_name')}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="small">Industry</label>
                    <select
                      className="form-control"
                      value={form.industry}
                      onChange={set('industry')}
                      style={inputStyle}
                    >
                      <option value="">Select</option>
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="small">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={set('password')}
                  style={inputStyle}
                  required
                  minLength={6}
                />
              </div>

              <button
                className="btn w-100"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #22C55E)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-3 small">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#22C55E' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
<div
  className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center position-relative"
  style={{
    background: 'linear-gradient(135deg, #4F46E5, #22C55E)',
    color: 'white',
    overflow: 'hidden'
  }}
>
  <div style={{
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: '#6366F1',
    borderRadius: '50%',
    filter: 'blur(120px)',
    top: '-50px',
    left: '-50px',
    opacity: 0.4
  }} />

  <div style={{
    position: 'absolute',
    width: '250px',
    height: '250px',
    background: '#22C55E',
    borderRadius: '50%',
    filter: 'blur(120px)',
    bottom: '-50px',
    right: '-50px',
    opacity: 0.4
  }} />
  <div
    style={{
      backdropFilter: 'blur(10px)',
      background: 'rgba(255,255,255,0.08)',
      padding: '20px',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: 2
    }}
  >
    <img
      src={img}
      alt="register"
      style={{
        width: '100%',
        maxWidth: '380px',
        borderRadius: '12px',
        transition: 'transform 0.4s ease'
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    />
  </div>
  <h2
    className="mt-4"
    style={{
      fontSize: '48px',
      fontWeight: '900',
      fontFamily: "'Ubuntu', sans-serif",
      letterSpacing: '1px',
      zIndex: 2
    }}
  >
    Join & Grow 🚀
  </h2>
  <p
    className="mt-2"
    style={{
      fontSize: '22px',
      maxWidth: '420px',
      opacity: 0.9,
      lineHeight: '1.6',
      fontFamily: "'Ubuntu', sans-serif",
      zIndex: 2
    }}
  >
    Discover opportunities, connect with top companies, and build your dream career with confidence.
  </p>

</div>

      </div>
    </div>
  );
};

const inputStyle = {
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  color: '#E2E8F0',
  borderRadius: '8px',
  padding: '8px'
};

export default Register;