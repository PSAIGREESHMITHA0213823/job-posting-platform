// // import React, { useState } from 'react';
// // import { useNavigate, Link } from 'react-router-dom';
// // import { register } from '../services/api';

// // const Register = () => {
// //   const navigate = useNavigate();
// //   const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');
// //     try {
// //       const data = await register(form);
// //       localStorage.setItem('token', data.token);
// //       navigate('/dashboard');
// //     } catch (err) {
// //       setError(err.message || 'Registration failed');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

// //   return (
// //     <div className="auth-page">
// //       <div className="auth-card">
// //         <div className="auth-brand">
// //           <i className="bi bi-lightning-charge-fill text-warning me-2 fs-4" />
// //           <span className="fs-4 fw-bold">JobPortal</span>
// //         </div>
// //         <h2 className="auth-title">Create account</h2>
// //         <p className="auth-sub">Start your job search journey</p>
// //         {error && <div className="alert alert-danger py-2 small">{error}</div>}
// //         <form onSubmit={handleSubmit}>
// //           <div className="mb-3">
// //             <label className="form-label fw-medium">Full Name</label>
// //             <input className="form-control" placeholder="John Doe" value={form.full_name} onChange={set('full_name')} required />
// //           </div>
// //           <div className="mb-3">
// //             <label className="form-label fw-medium">Email</label>
// //             <input type="email" className="form-control" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
// //           </div>
// //           <div className="mb-3">
// //             <label className="form-label fw-medium">Phone (optional)</label>
// //             <input className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
// //           </div>
// //           <div className="mb-4">
// //             <label className="form-label fw-medium">Password</label>
// //             <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
// //           </div>
// //           <button className="btn btn-primary btn-lg w-100" disabled={loading}>
// //             {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
// //             {loading ? 'Creating account...' : 'Create Account'}
// //           </button>
// //         </form>
// //         <p className="text-center mt-3 text-muted small">
// //           Already have an account? <Link to="/login" className="text-primary fw-medium">Sign in</Link>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Register = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [role, setRole] = useState('employee'); // 'employee' | 'company_manager'
//   const [form, setForm] = useState({
//     email: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     company_name: '',
//     industry: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const endpoint =
//         role === 'company_manager'
//           ? '/api/auth/register/company'
//           : '/api/auth/register/employee';

//       const payload =
//         role === 'company_manager'
//           ? {
//               email: form.email,
//               password: form.password,
//               full_name: form.full_name,
//               phone: form.phone,
//               company_name: form.company_name,
//               industry: form.industry,
//             }
//           : {
//               email: form.email,
//               password: form.password,
//               full_name: form.full_name,
//               phone: form.phone,
//             };

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || 'Registration failed');
//       }

//       // Store token and redirect based on role
//       localStorage.setItem('token', data.token);

//       if (data.user.role === 'company_manager') {
//         navigate('/company/dashboard');
//       } else {
//         navigate('/dashboard');
//       }
//     } catch (err) {
//       setError(err.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <div className="auth-brand">
//           <i className="bi bi-lightning-charge-fill text-warning me-2 fs-4" />
//           <span className="fs-4 fw-bold">JobPortal</span>
//         </div>
//         <h2 className="auth-title">Create account</h2>
//         <p className="auth-sub">Choose how you want to use JobPortal</p>

//         {/* Role Toggle */}
//         <div className="btn-group w-100 mb-4" role="group">
//           <button
//             type="button"
//             className={`btn ${role === 'employee' ? 'btn-primary' : 'btn-outline-primary'}`}
//             onClick={() => setRole('employee')}
//           >
//             <i className="bi bi-person-fill me-1" />
//             Job Seeker
//           </button>
//           <button
//             type="button"
//             className={`btn ${role === 'company_manager' ? 'btn-primary' : 'btn-outline-primary'}`}
//             onClick={() => setRole('company_manager')}
//           >
//             <i className="bi bi-building me-1" />
//             Company
//           </button>
//         </div>

//         {error && <div className="alert alert-danger py-2 small">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label fw-medium">Full Name</label>
//             <input
//               className="form-control"
//               placeholder="John Doe"
//               value={form.full_name}
//               onChange={set('full_name')}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-medium">Email</label>
//             <input
//               type="email"
//               className="form-control"
//               placeholder="you@email.com"
//               value={form.email}
//               onChange={set('email')}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-medium">Phone (optional)</label>
//             <input
//               className="form-control"
//               placeholder="+91 98765 43210"
//               value={form.phone}
//               onChange={set('phone')}
//             />
//           </div>

//           {/* Company-specific fields */}
//           {role === 'company_manager' && (
//             <>
//               <div className="mb-3">
//                 <label className="form-label fw-medium">Company Name</label>
//                 <input
//                   className="form-control"
//                   placeholder="Acme Inc."
//                   value={form.company_name}
//                   onChange={set('company_name')}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label fw-medium">Industry (optional)</label>
//                 <select
//                   className="form-select"
//                   value={form.industry}
//                   onChange={set('industry')}
//                 >
//                   <option value="">Select industry</option>
//                   <option value="Technology">Technology</option>
//                   <option value="Finance">Finance</option>
//                   <option value="Healthcare">Healthcare</option>
//                   <option value="Education">Education</option>
//                   <option value="Retail">Retail</option>
//                   <option value="Manufacturing">Manufacturing</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//             </>
//           )}

//           <div className="mb-4">
//             <label className="form-label fw-medium">Password</label>
//             <input
//               type="password"
//               className="form-control"
//               placeholder="Min 6 characters"
//               value={form.password}
//               onChange={set('password')}
//               required
//               minLength={6}
//             />
//           </div>

//           <button className="btn btn-primary btn-lg w-100" disabled={loading}>
//             {loading && <span className="spinner-border spinner-border-sm me-2" />}
//             {loading
//               ? 'Creating account...'
//               : role === 'company_manager'
//               ? 'Create Company Account'
//               : 'Create Account'}
//           </button>
//         </form>

//         <p className="text-center mt-3 text-muted small">
//           Already have an account?{' '}
//           <Link to="/login" className="text-primary fw-medium">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
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