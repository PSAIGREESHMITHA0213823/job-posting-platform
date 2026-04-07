import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from "../assets/login.jpg";
import "../index.css"

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(form.email, form.password);

      if (data.user.role !== 'employee') {
        setError('This portal is for employees only.');
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid p-0"
      style={{
        fontFamily: "'Ubuntu', sans-serif",
        background: 'linear-gradient(120deg, #0F172A, #1E293B)',
        minHeight: '100vh'
      }}
    >
      <div className="row min-vh-100 m-0">
        <div className="col-md-6 d-flex align-items-center justify-content-center p-4">

          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '45px',
              borderRadius: '22px',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#E2E8F0',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}
          >
            <div className="text-center mb-4">
              <h1
                style={{
                  color: '#6366F1',
                  letterSpacing: '1px',
                  fontWeight: '900',
                  fontFamily: "'Ubuntu', sans-serif",
                  fontSize:"40px"
                }}
              >
                JobPortal
              </h1>
              <p style={{ color: '#94A3B8', fontWeight: '500',fontFamily: "'Ubuntu', sans-serif" ,fontSize:"25px"}}>
                Welcome back 👋
              </p>
            </div>
            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>

              <div className="mb-4">
                <label className="mb-2" style={{fontFamily: "'Ubuntu', sans-serif"}}>Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg custom-placeholder"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-4" style={{fontFamily: "'Ubuntu', sans-serif"}}>
                <label className="mb-2">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg custom-placeholder"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={inputStyle}
                  required
                />
              </div>

              <button
                className="btn w-100"
                disabled={loading}
                style={{
                  background: '#6366F1',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: '0.3s',
                  fontFamily: "'Ubuntu', sans-serif"
                }}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

            </form>
            <p className="text-center mt-4 small" style={{fontFamily: "'Ubuntu', sans-serif"}}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#22C55E',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontFamily: "'Ubuntu', sans-serif"
                }}
              >
                Register
              </Link>
            </p>

          </div>
        </div>
        <div
          className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-center p-5"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #22C55E)',
            color: 'white'
          }}
        >

          <img
            src={img}
            alt="job"
            style={{
            width: '100%',
            maxWidth: '440px',
            height: 'auto',
            marginBottom: '20px',
            borderRadius: '16px'
            }}
          />

          <h1 style={{ fontSize: '42px', fontWeight: '700',fontFamily: "'Ubuntu', sans-serif" }}>
            Build Your Career 🚀
          </h1>

          <p style={{ fontSize: '18px', maxWidth: '420px', opacity: 0.9 ,fontFamily: "'Ubuntu', sans-serif"}}>
            Discover opportunities, connect with top companies, and take the next step toward your dream job.
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
  borderRadius: '10px',
  padding: '12px',
  fontFamily: "'Ubuntu', sans-serif"
};

export default Login;