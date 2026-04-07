import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // start true — we don't know yet

  // Run ONCE on mount to restore session from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false); // no token → not logged in, stop loading immediately
      return;
    }

    getMe()
      .then(d => {
        setUser(d.user);
        setProfile(d.profile);
      })
      .catch(() => {
        // Token is invalid/expired — clear it
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false); // always stop loading
      });
  }, []); // empty array = only on mount, never re-runs

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);       // set user from login response directly
    setProfile(data.profile ?? null); // use profile from login if available
    // DO NOT call getMe() again here — it causes a flicker
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
