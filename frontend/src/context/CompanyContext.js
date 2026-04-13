
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CompanyContext = createContext({});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl]         = useState('');
  const [loading, setLoading]         = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProfile = () => {
    setLoading(true);
    axios.get(`${API}/company/profile`, { headers: getHeaders() })
      .then(res => {
        const d = res.data?.data || {};
        setCompanyName(d.name || '');
        setLogoUrl(
          d.logo_url
            ? (d.logo_url.startsWith('http') ? d.logo_url : `http://localhost:5000${d.logo_url}`)
            : ''
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  // Re-fetch everything from server
  const refreshProfile = () => fetchProfile();

  // Instantly update logo without re-fetching
  const updateLogo = (url) => {
    setLogoUrl(url.startsWith('http') ? url : `http://localhost:5000${url}`);
  };

  // Instantly update company name
  const updateName = (name) => setCompanyName(name);

  return (
    <CompanyContext.Provider value={{ companyName, logoUrl, loading, refreshProfile, updateLogo, updateName }}>
      {children}
    </CompanyContext.Provider>
  );
};