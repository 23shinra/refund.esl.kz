import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { DEFAULT_LOGIN_ROLE } from '../constants/userRoles.js';
import { clearAuthSession, readAuthSession, writeAuthSession } from '../utils/authSession.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readAuthSession());

  const login = useCallback((phone, role = DEFAULT_LOGIN_ROLE) => {
    writeAuthSession({ phone, role });
    setSession(readAuthSession());
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      login,
      logout,
      isAuthenticated: Boolean(session?.phone),
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
