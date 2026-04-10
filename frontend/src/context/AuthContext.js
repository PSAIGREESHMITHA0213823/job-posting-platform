// // // // // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // // // // import { getMe, login as apiLogin } from '../services/api';

// // // // // // const AuthContext = createContext(null);

// // // // // // export const AuthProvider = ({ children }) => {
// // // // // //   const [user, setUser] = useState(null);
// // // // // //   const [profile, setProfile] = useState(null);
// // // // // //   const [loading, setLoading] = useState(true);

// // // // // //   useEffect(() => {
// // // // // //     const token = localStorage.getItem('token');
// // // // // //     if (token) {
// // // // // //       getMe()
// // // // // //         .then(d => { setUser(d.user); setProfile(d.profile); })
// // // // // //         .catch(() => localStorage.removeItem('token'))
// // // // // //         .finally(() => setLoading(false));
// // // // // //     } else setLoading(false);
// // // // // //   }, []);

// // // // // //   const login = async (email, password) => {
// // // // // //     const data = await apiLogin(email, password);
// // // // // //     localStorage.setItem('token', data.token);
// // // // // //     setUser(data.user);
// // // // // //     const me = await getMe();
// // // // // //     setProfile(me.profile);
// // // // // //     return data;
// // // // // //   };

// // // // // //   const logout = () => {
// // // // // //     localStorage.removeItem('token');
// // // // // //     setUser(null);
// // // // // //     setProfile(null);
// // // // // //   };

// // // // // //   return (
// // // // // //     <AuthContext.Provider value={{ user, profile, setProfile, login, logout, loading }}>
// // // // // //       {children}
// // // // // //     </AuthContext.Provider>
// // // // // //   );
// // // // // // };

// // // // // // export const useAuth = () => useContext(AuthContext);
// // // // // import React, { createContext, useContext, useState } from 'react';

// // // // // const AuthContext = createContext(null);

// // // // // export function AuthProvider({ children }) {
// // // // //   const [user, setUserState] = useState(() => {
// // // // //     try {
// // // // //       const stored = localStorage.getItem('user');
// // // // //       return stored ? JSON.parse(stored) : null;
// // // // //     } catch {
// // // // //       return null;
// // // // //     }
// // // // //   });

// // // // //   const setUser = (updater) => {
// // // // //     setUserState(prev => {
// // // // //       const next = typeof updater === 'function' ? updater(prev) : updater;
// // // // //       if (next) {
// // // // //         localStorage.setItem('user', JSON.stringify(next));
// // // // //       } else {
// // // // //         localStorage.removeItem('user');
// // // // //       }
// // // // //       return next;
// // // // //     });
// // // // //   };

// // // // //   const logout = () => {
// // // // //     localStorage.removeItem('token');
// // // // //     localStorage.removeItem('user');
// // // // //     setUserState(null);
// // // // //   };

// // // // //   return (
// // // // //     <AuthContext.Provider value={{ user, setUser, logout }}>
// // // // //       {children}
// // // // //     </AuthContext.Provider>
// // // // //   );
// // // // // }

// // // // // export function useAuth() {
// // // // //   const ctx = useContext(AuthContext);
// // // // //   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
// // // // //   return ctx;
// // // // // }
// // // // import React, { createContext, useContext, useState } from 'react';

// // // // const AuthContext = createContext(null);

// // // // const BASE_URL = 'http://localhost:5000';

// // // // export function AuthProvider({ children }) {
// // // //   const [user, setUserState] = useState(() => {
// // // //     try {
// // // //       const stored = localStorage.getItem('user');
// // // //       return stored ? JSON.parse(stored) : null;
// // // //     } catch {
// // // //       return null;
// // // //     }
// // // //   });

// // // //   const setUser = (updater) => {
// // // //     setUserState(prev => {
// // // //       const next = typeof updater === 'function' ? updater(prev) : updater;
// // // //       if (next) {
// // // //         localStorage.setItem('user', JSON.stringify(next));
// // // //       } else {
// // // //         localStorage.removeItem('user');
// // // //       }
// // // //       return next;
// // // //     });
// // // //   };

// // // //   // ✅ login function — calls API, saves token + user
// // // //   const login = async (email, password) => {
// // // //     const res = await fetch(`${BASE_URL}/api/auth/login`, {
// // // //       method: 'POST',
// // // //       headers: { 'Content-Type': 'application/json' },
// // // //       body: JSON.stringify({ email, password }),
// // // //     });
// // // //     const data = await res.json();
// // // //     if (!res.ok) throw new Error(data.message || 'Login failed');
// // // //     localStorage.setItem('token', data.token);
// // // //     setUser(data.user);
// // // //     return data; // Login.js uses data.user.role to redirect
// // // //   };

// // // //   const logout = () => {
// // // //     localStorage.removeItem('token');
// // // //     localStorage.removeItem('user');
// // // //     setUserState(null);
// // // //   };

// // // //   return (
// // // //     <AuthContext.Provider value={{ user, setUser, login, logout }}>
// // // //       {children}
// // // //     </AuthContext.Provider>
// // // //   );
// // // // }

// // // // export function useAuth() {
// // // //   const ctx = useContext(AuthContext);
// // // //   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
// // // //   return ctx;
// // // // }
// // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // import { getMe, login as apiLogin } from '../services/api';

// // // const AuthContext = createContext(null);

// // // const BASE_URL = 'http://localhost:5000';

// // // export function AuthProvider({ children }) {
// // //   const [user, setUserState] = useState(() => {
// // //     try {
// // //       const stored = localStorage.getItem('user');
// // //       return stored ? JSON.parse(stored) : null;
// // //     } catch {
// // //       return null;
// // //     }
// // //   });
// // //   const [profile, setProfile] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   // Persist user to localStorage on every change
// // //   const setUser = (updater) => {
// // //     setUserState(prev => {
// // //       const next = typeof updater === 'function' ? updater(prev) : updater;
// // //       if (next) {
// // //         localStorage.setItem('user', JSON.stringify(next));
// // //       } else {
// // //         localStorage.removeItem('user');
// // //       }
// // //       return next;
// // //     });
// // //   };

// // //   // On mount: if a token exists, rehydrate user + profile from /me
// // //   useEffect(() => {
// // //     const token = localStorage.getItem('token');
// // //     if (token) {
// // //       getMe()
// // //         .then(d => {
// // //           setUser(d.user);
// // //           setProfile(d.profile);
// // //         })
// // //         .catch(() => {
// // //           // Token is invalid/expired — clean up
// // //           localStorage.removeItem('token');
// // //           localStorage.removeItem('user');
// // //           setUserState(null);
// // //         })
// // //         .finally(() => setLoading(false));
// // //     } else {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   // Login: call API, persist token + user, fetch full profile
// // //   const login = async (email, password) => {
// // //     const res = await fetch(`${BASE_URL}/api/auth/login`, {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify({ email, password }),
// // //     });
// // //     const data = await res.json();
// // //     if (!res.ok) throw new Error(data.message || 'Login failed');

// // //     localStorage.setItem('token', data.token);
// // //     setUser(data.user);

// // //     // Fetch and set full profile after login
// // //     const me = await getMe();
// // //     setProfile(me.profile);

// // //     return data; // Caller can use data.user.role for redirects
// // //   };

// // //   const logout = () => {
// // //     localStorage.removeItem('token');
// // //     localStorage.removeItem('user');
// // //     setUserState(null);
// // //     setProfile(null);
// // //   };

// // //   return (
// // //     <AuthContext.Provider value={{ user, setUser, profile, setProfile, login, logout, loading }}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // }

// // // export function useAuth() {
// // //   const ctx = useContext(AuthContext);
// // //   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
// // //   return ctx;
// // // }
// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import { getMe, login as apiLogin } from '../services/api';

// // const AuthContext = createContext(null);

// // const BASE_URL = 'http://localhost:5000';

// // export function AuthProvider({ children }) {
// //   const [user, setUserState] = useState(() => {
// //     try {
// //       const stored = localStorage.getItem('user');
// //       return stored ? JSON.parse(stored) : null;
// //     } catch {
// //       return null;
// //     }
// //   });
// //   const [profile, setProfile] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // Sync user to localStorage on every change
// //   const setUser = (updater) => {
// //     setUserState(prev => {
// //       const next = typeof updater === 'function' ? updater(prev) : updater;
// //       if (next) {
// //         localStorage.setItem('user', JSON.stringify(next));
// //       } else {
// //         localStorage.removeItem('user');
// //       }
// //       return next;
// //     });
// //   };

// //   // On mount: validate token and rehydrate user + profile
// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       getMe()
// //         .then(d => {
// //           setUser(d.user);
// //           setProfile(d.profile);
// //         })
// //         .catch(() => {
// //           localStorage.removeItem('token');
// //           localStorage.removeItem('user');
// //           setUserState(null);
// //         })
// //         .finally(() => setLoading(false));
// //     } else {
// //       setLoading(false);
// //     }
// //   }, []);

// //   // Works for ALL roles: admin, company_manager, employee
// //   const login = async (email, password) => {
// //     const res = await fetch(`${BASE_URL}/api/auth/login`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ email, password }),
// //     });
// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data.message || 'Login failed');

// //     localStorage.setItem('token', data.token);
// //     setUser(data.user);

// //     // Fetch full profile after login (works for all roles)
// //     try {
// //       const me = await getMe();
// //       setProfile(me.profile);
// //     } catch {
// //       // profile is optional — don't block login if it fails
// //     }

// //     return data; // caller uses data.user.role to redirect
// //   };

// //   const logout = () => {
// //     localStorage.removeItem('token');
// //     localStorage.removeItem('user');
// //     setUserState(null);
// //     setProfile(null);
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, setUser, profile, setProfile, login, logout, loading }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export function useAuth() {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
// //   return ctx;
// // }
// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext(null);

// const BASE_URL = 'http://localhost:5000';

// export function AuthProvider({ children }) {
//   const [user, setUserState] = useState(() => {
//     try {
//       const stored = localStorage.getItem('user');
//       return stored ? JSON.parse(stored) : null;
//     } catch {
//       return null;
//     }
//   });
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Persist user to localStorage on every change
//   const setUser = (updater) => {
//     setUserState(prev => {
//       const next = typeof updater === 'function' ? updater(prev) : updater;
//       if (next) {
//         localStorage.setItem('user', JSON.stringify(next));
//       } else {
//         localStorage.removeItem('user');
//       }
//       return next;
//     });
//   };

//   // On mount: validate token → rehydrate user + profile from /me
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     fetch(`${BASE_URL}/api/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(async res => {
//         if (!res.ok) throw new Error('Invalid token');
//         const d = await res.json();
//         setUser(d.user);
//         setProfile(d.profile ?? null);
//       })
//       .catch(() => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setUserState(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Login — works for all roles: admin, company_manager, employee
//   const login = async (email, password) => {
//     const res = await fetch(`${BASE_URL}/api/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || 'Login failed');

//     localStorage.setItem('token', data.token);
//     setUser(data.user);

//     // Fetch full profile right after login
//     try {
//       const token = data.token;
//       const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (meRes.ok) {
//         const me = await meRes.json();
//         setProfile(me.profile ?? null);
//       }
//     } catch {
//       // profile is optional — don't block login
//     }

//     return data; // caller uses data.user.role to redirect
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUserState(null);
//     setProfile(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, profile, setProfile, login, logout, loading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
//   return ctx;
// }
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