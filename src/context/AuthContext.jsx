import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  signup as signupRequest,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as logoutRequest,
  fetchCurrentUser,
} from '../utils/authApi';
import { setToken, clearToken } from '../utils/authToken';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signup: async (payload) => {
        const { user, token } = await signupRequest(payload);
        setToken(token);
        setUser(user);
        return user;
      },
      login: async (payload) => {
        const { user, token } = await loginRequest(payload);
        setToken(token);
        setUser(user);
        return user;
      },
      loginWithGoogle: async (credential) => {
        const { user, token } = await loginWithGoogleRequest(credential);
        setToken(token);
        setUser(user);
        return user;
      },
      logout: async () => {
        await logoutRequest();
        clearToken();
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
