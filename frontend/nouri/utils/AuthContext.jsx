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

function clearStoredUser() {
  try {
    localStorage.removeItem('current_user');
  } catch {
    /* ignore */
  }
}

// JWT segments are base64url (RFC 7515): '-'/'_' instead of '+'/'/', no
// padding, and UTF-8 bytes. Plain atob() throws on the former and garbles
// non-ASCII names.
function decodeJwtPayload(token) {
  const seg = String(token).split('.')[1] || '';
  const b64 = seg.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(seg.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function readAuth() {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const stored = readStoredUser();
  // Authenticated only with a real JWT — never promote tokenless current_user.
  if (!token) {
    if (stored) clearStoredUser();
    return { user: null, isAuthenticated: false, isAdmin: false };
  }
  try {
    const payload = decodeJwtPayload(token);
    // Expired token: every AI call would 401. Show signed-out state; the
    // host app owns the actual logout and storage cleanup.
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
      return { user: null, isAuthenticated: false, isAdmin: false };
    }
    const jwtUser = {
      id: String(payload.sub || payload.user_id || payload.id || ''),
      email: payload.email || stored?.email,
      name: payload.name || stored?.name || payload.email,
      role: payload.role || stored?.role || 'recipient',
      is_admin: Boolean(payload.is_admin ?? stored?.is_admin),
      community_id: payload.community_id ?? stored?.community_id ?? null,
      approval_number: payload.approval_number ?? stored?.approval_number ?? null,
      address: payload.address || stored?.address || null,
    };
    // JWT wins identity fields; stored may hold UX extras only when not in JWT.
    const user = stored ? { ...stored, ...jwtUser, id: jwtUser.id || stored.id } : jwtUser;
    if (!user.id) {
      return { user: null, isAuthenticated: false, isAdmin: false };
    }
    return {
      user,
      isAuthenticated: true,
      isAdmin: Boolean(user.is_admin) || String(user.role || '').toLowerCase() === 'admin',
    };
  } catch {
    clearStoredUser();
    return { user: null, isAuthenticated: false, isAdmin: false };
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
