// // import React, { useState } from 'react';
// // import { useNavigate, Link } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // const Login = () => {
// //   const { login } = useAuth();
// //   const navigate = useNavigate();
// //   const [form, setForm] = useState({ email: '', password: '' });
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');
// //     try {
// //       const data = await login(form.email, form.password);
// //       if (data.user.role !== 'employee') {
// //         setError('This portal is for employees only.');
// //         return;
// //       }
// //       navigate('/dashboard');
// //     } catch (err) {
// //       setError(err.message || 'Login failed');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="auth-page">
// //       <div className="auth-card">
// //         <div className="auth-brand">
// //           <i className="bi bi-lightning-charge-fill text-warning me-2 fs-4" />
// //           <span className="fs-4 fw-bold">JobPortal</span>
// //         </div>
// //         <h2 className="auth-title">Welcome back</h2>
// //         <p className="auth-sub">Sign in to your employee account</p>
// //         {error && <div className="alert alert-danger py-2 small">{error}</div>}
// //         <form onSubmit={handleSubmit}>
// //           <div className="mb-3">
// //             <label className="form-label fw-medium">Email</label>
// //             <input
// //               type="email"
// //               className="form-control form-control-lg"
// //               placeholder="you@email.com"
// //               value={form.email}
// //               onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
// //               required
// //             />
// //           </div>
// //           <div className="mb-4">
// //             <label className="form-label fw-medium">Password</label>
// //             <input
// //               type="password"
// //               className="form-control form-control-lg"
// //               placeholder="••••••••"
// //               value={form.password}
// //               onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
// //               required
// //             />
// //           </div>
// //           <button className="btn btn-primary btn-lg w-100" disabled={loading}>
// //             {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
// //             {loading ? 'Signing in...' : 'Sign In'}
// //           </button>
// //         </form>
// //         <p className="text-center mt-3 text-muted small">
// //           Don't have an account? <Link to="/register" className="text-primary fw-medium">Register</Link>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const data = await login(form.email, form.password);
//       const role = data.user.role;

//       if (role === 'admin') {
//         navigate('/admin/dashboard');
//       } else if (role === 'company_manager') {
//         navigate('/company/dashboard');
//       } else if (role === 'employee') {
//         navigate('/dashboard');
//       } else {
//         setError('Unknown role. Please contact support.');
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed');
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
//         <h2 className="auth-title">Welcome back</h2>
//         <p className="auth-sub">Sign in to your account</p>

//         {error && <div className="alert alert-danger py-2 small">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label fw-medium">Email</label>
//             <input
//               type="email"
//               className="form-control form-control-lg"
//               placeholder="you@email.com"
//               value={form.email}
//               onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="form-label fw-medium">Password</label>
//             <input
//               type="password"
//               className="form-control form-control-lg"
//               placeholder="••••••••"
//               value={form.password}
//               onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
//               required
//             />
//           </div>
//           <button className="btn btn-primary btn-lg w-100" disabled={loading}>
//             {loading && <span className="spinner-border spinner-border-sm me-2" />}
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <p className="text-center mt-3 text-muted small">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-primary fw-medium">Register</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from "../assets/login.jpg";
import logo from "../assets/logo.png"; 
import "../App.css";

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
    <div className="login-container">
      <div className="login-left">
        <div className="login-card">
          <div className="brand-section">
            <img src={logo} alt="logo" className="logo" />
            <h1 className="brand-name">ShnoorJob</h1>
            <p className="tagline">Connecting talent with opportunity 🚀</p>
          </div>

          <h2 className="title">Welcome back 👋</h2>
          <p className="subtitle">Please enter your details</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/register">Sign up</Link>
          </p>

        </div>
      </div>
      <div className="login-right">
        <img src={img} alt="login" />
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
        }
      `}</style>
    </div>
  );
};

export default Login;
export const themes = {
  default: {
    primary: "#6366F1",     
    secondary: "#06B6D4",    
    bg: "#0F172A",
    surface: "#1E293B",
    text: "#E2E8F0",
    textSecondary: "#94A3B8",
  },

  pink: {
    primary: "#EC4899",    
    secondary: "#8B5CF6",    
    bg: "#1F0A14",
    surface: "#3F1D2E",
    text: "#FCE7F3",
    textSecondary: "#94A3B8",
  },

  sunset: {
    primary: "#F97316",      
    secondary: "#EAB308",  
    bg: "#1C1917",
    surface: "#292524",
    text: "#FFF7ED",
    textSecondary: "#94A3B8",
  },

  mono: {
    primary: "#A1A1AA",      
    secondary: "#22C55E",   
    bg: "#09090B",
    surface: "#18181B",
    text: "#FAFAFA",
    textSecondary: "#94A3B8",
  }
};
