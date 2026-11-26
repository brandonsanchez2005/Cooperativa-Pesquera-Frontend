import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { request } from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'cooperativa.token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    request('/usuarios/me/', { token })
      .then((profile) => { if (active) setUser(profile); })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function login(username, password) {
    const result = await request('/token/', { method: 'POST', body: { username, password } });
    if (!result?.token) throw new Error('La respuesta de autenticación no incluyó un token.');
    const profile = await request('/usuarios/me/', { token: result.token });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(profile);
    return profile;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
