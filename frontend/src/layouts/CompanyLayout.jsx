import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  File,
  LogOut,
} from 'lucide-react';
import axios from 'axios';
import logo from "../assets/logo.png";

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  // ✅ Fixed: proper template literal with backticks
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CompanyLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await axios.get(`${API}/company/profile`, {
          headers: getAuthHeaders(),
        });

        const d = res.data?.data || {};

        if (d.logo_url) {
          // ✅ Handle both absolute and relative URLs safely
          const logoUrl = d.logo_url.startsWith('http')
            ? d.logo_url
            : `${API.replace('/api', '')}${d.logo_url}`;
          console.log(logoUrl);
          setCompanyLogo(logoUrl);
        }
      } catch (err) {
        console.error("Error fetching company profile:", err);
      }
    };
    fetchCompanyProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/company/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { path: '/company/jobs', label: 'Job Postings', icon: <BriefcaseBusiness /> },
    { path: '/company/applications', label: 'Applications', icon: <File /> },
    { path: '/company/profile', label: 'Company Profile', icon: <Building2 /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', sans-serif",
        background: '#f4f6fb',
      }}
    >
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          zIndex: 1000,
          height: isMobile ? '100vh' : 'auto',
          width: sidebarOpen ? '240px' : isMobile ? '0px' : '60px',
          background: 'linear-gradient(180deg, #1a1f36 0%, #2d3561 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          flexShrink: 0,
          left: sidebarOpen ? '0' : isMobile ? '-240px' : '0',
          top: 0,
        }}
      >
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#4f6ef7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={companyLogo || logo}
              alt="company-logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.src = logo; 
              }}
            />
          </div>

          {sidebarOpen && (
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              Company Portal
            </span>
          )}
        </div>
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive
                  ? 'rgba(79,110,247,0.3)'
                  : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              })}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {sidebarOpen && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(255,80,80,0.15)',
              border: '1px solid rgba(255,80,80,0.3)',
              color: '#ff6b6b',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <LogOut />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e8ecf4',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ☰
          </button>

          <span style={{ fontWeight: 600, color: '#1a1f36' }}>
            Company Manager
          </span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;