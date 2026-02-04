import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'srishna_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const setToken = (t) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      setTokenState(t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMe(token)
      .then((u) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser({ id: res.id, email: res.email, name: res.name });
    return res;
  };

  const signup = async (email, password, name) => {
    const res = await apiSignup(email, password, name);
    setToken(res.token);
    setUser({ id: res.id, email: res.email, name: res.name });
    return res;
  };

  const logout = () => setToken(null);

  const value = { user, token, loading, login, signup, logout, setToken };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
