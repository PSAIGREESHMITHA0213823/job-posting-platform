import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import img from "../assets/register.jpg";
import "../index.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: ''  
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      setError("Please select a role");
      return;
    }

    console.log("Submitting form:", form);

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

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div
      className="container-fluid p-0"
      style={{
        fontFamily: "'Ubuntu', sans-serif",
        background: 'linear-gradient(120deg, #0F172A, #1E293B)',
        height: '100vh',
        overflow: 'hidden'
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
              <h2 style={{ color: '#6366F1', fontWeight: '900', fontSize: "42px" }}>
                JobPortal
              </h2>
              <p style={{ color: '#94A3B8', fontSize: "20px" }}>
                Create your account 🚀
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="mb-2">
                <label className="small">Name</label>
                <input
                  className="form-control custom-placeholder"
                  placeholder="Enter name"
                  value={form.full_name}
                  onChange={set('full_name')}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="small">Email</label>
                <input
                  type="email"
                  className="form-control custom-placeholder"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={set('email')}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="small">Phone</label>
                <input
                  className="form-control custom-placeholder"
                  placeholder="Enter phone"
                  value={form.phone}
                  onChange={set('phone')}
                  style={inputStyle}
                />
              </div>

              <div className="mb-2">
                <label className="small">Role</label>
                <select
                  className="form-control custom-placeholder"
                  value={form.role}
                  onChange={set('role')}
                  style={inputStyle}
                  required  
                >
                  <option value="">Select role</option>
                  <option value="employee">Employee</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                  <option value="company_manager">Admin</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="small">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-control custom-placeholder"
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
          className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center h-100"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #22C55E)',
            color: 'white'
          }}
        >
          <img
            src={img}
            alt="register"
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '16px'
            }}
          />

          <h2 style={{ fontSize: '42px', fontWeight: '700' }}>
            Join & Grow 🚀
          </h2>
          <p style={{ fontSize: '18px', maxWidth: '420px', opacity: 0.9 }}>
            Explore jobs and build your career.
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