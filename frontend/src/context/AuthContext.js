
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BASE_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (updater) => {
    setUserState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next) {
        localStorage.setItem('user', JSON.stringify(next));
      } else {
        localStorage.removeItem('user');
      }
      return next;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error('Invalid token');
        const d = await res.json();
        setUser(prev => ({
          ...prev,
          ...d.user,
          avatar_url: d.user?.avatar_url || prev?.avatar_url || null,
        }));
        setProfile(d.profile ?? null);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('token', data.token);

    let freshUser = data.user;
    try {
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        freshUser = {
          ...data.user,
          ...me.user,
          avatar_url: me.user?.avatar_url || data.user?.avatar_url || null,
        };
        setProfile(me.profile ?? null);
      }
    } catch {
      // profile is optional — don't block login
    }

    setUser(freshUser);
    return { ...data, user: freshUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserState(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, profile, setProfile, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}