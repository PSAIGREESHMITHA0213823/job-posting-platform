
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from "../assets/register.jpg";
import logo from "../assets/logo.png";
import "../App.css"

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
    <div className="login-container">
      <div className="login-left">
        <div className="login-card register-card">
          <div className="brand-section">
            <img src={logo} alt="logo" className="logo" />
            <h1 className="brand-name">ShnoorJob</h1>
            <p className="tagline">Create your account 🚀</p>
          </div>
          <div className="role-switch">
            <button
              className={role === 'employee' ? 'active' : ''}
              onClick={() => setRole('employee')}
              type="button"
            >
              Job Seeker
            </button>

            <button
              className={role === 'company_manager' ? 'active' : ''}
              onClick={() => setRole('company_manager')}
              type="button"
            >
              Company
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={form.full_name}
                  onChange={set('full_name')}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={set('phone')}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {role === 'company_manager' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    value={form.company_name}
                    onChange={set('company_name')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <select
                    value={form.industry}
                    onChange={set('industry')}
                  >
                    <option value="">Select</option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                  </select>
                </div>
              </div>
            )}

            <button className="login-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="signup-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
      <div className="login-right">
        <img src={img} alt="register" />
      </div>
      <style>{`
        :root {
          --primary: #6366F1;
          --secondary: #22C55E;
          --bg: #0F172A;
          --surface: #1E293B;
          --text: #E2E8F0;
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }

          .login-right {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;