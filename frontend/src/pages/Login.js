import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from "../assets/login.jpg";

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
      const role = data.user.role;

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'company_manager') {
        navigate('/company/dashboard');
      } else if (role === 'employee') {
        navigate('/dashboard');
      } else {
        setError('Unknown role. Please contact support.');
      }
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
              maxWidth: '420px',
              padding: '25px',
              borderRadius: '18px',
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#E2E8F0',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div className="text-center mb-3">
              <h2 style={{ color: '#6366F1', fontWeight: '900', fontSize: "38px" }}>
                JobPortal
              </h2>
              <p style={{ color: '#94A3B8' }}>
                Welcome back 👋
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="small">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="small">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={inputStyle}
                  required
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-3 small">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#22C55E' }}>
                Register
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
              alt="login"
              style={{
                width: '100%',
                maxWidth: '360px',
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
              fontSize: '46px',
              fontWeight: '900',
              letterSpacing: '1px',
              zIndex: 2
            }}
          >
            Welcome Back 🚀
          </h2>

          <p
            className="mt-2"
            style={{
              fontSize: '20px',
              maxWidth: '400px',
              opacity: 0.9,
              lineHeight: '1.6',
              zIndex: 2
            }}
          >
            Login to explore jobs, manage applications, and grow your career faster.
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
  padding: '10px'
};

export default Login;