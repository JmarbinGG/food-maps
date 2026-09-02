import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
});

function readStoredUser() {
  try {
    const raw = localStorage.getItem('current_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readAuth() {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const stored = readStoredUser();
  if (!token) {
    return { user: stored, isAuthenticated: Boolean(stored?.id), isAdmin: Boolean(stored?.is_admin) };
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const jwtUser = {
      id: String(payload.sub || payload.user_id || payload.id || ''),
      email: payload.email || stored?.email,
      name: payload.name || stored?.name || payload.email,
      role: payload.role || stored?.role || 'recipient',
      is_admin: Boolean(payload.is_admin ?? stored?.is_admin),
      community_id: payload.community_id ?? stored?.community_id ?? null,
      address: payload.address || stored?.address || null,
    };
    const user = stored ? { ...jwtUser, ...stored, id: jwtUser.id || stored.id } : jwtUser;
    return {
      user,
      isAuthenticated: Boolean(user.id),
      isAdmin: Boolean(user.is_admin) || String(user.role || '').toLowerCase() === 'admin',
    };
  } catch {
    return {
      user: stored,
      isAuthenticated: Boolean(stored?.id),
      isAdmin: Boolean(stored?.is_admin),
    };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readAuth);

  useEffect(() => {
    const refresh = () => setAuth(readAuth());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('foodmaps:auth_changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('foodmaps:auth_changed', refresh);
    };
  }, []);

  const value = useMemo(() => ({
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
