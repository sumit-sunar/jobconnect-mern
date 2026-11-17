import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

const STORAGE_KEY = 'jobconnect_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and hydrate auth state on application startup
  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.token) {
            setToken(parsed.token);
            // Re-hydrate full fresh user profile from API
            const res = await authApi.getMe();
            if (res?.user) {
              setUser(res.user);
              // Refresh localStorage user document
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ token: parsed.token, user: res.user })
              );
            }
          }
        }
      } catch (err) {
        // Token invalid or expired: clear corrupted session
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: receivedToken, user: receivedUser })
    );

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  /**
   * Register a new user
   */
  const register = async (payload) => {
    const res = await authApi.register(payload);
    const { token: receivedToken, user: receivedUser } = res;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: receivedToken, user: receivedUser })
    );

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  /**
   * Update the current user in state and localStorage
   * Accepts a partial user object or an updater function.
   */
  const updateUser = (partialOrUpdater) => {
    setUser((prev) => {
      const updated =
        typeof partialOrUpdater === 'function'
          ? partialOrUpdater(prev)
          : { ...prev, ...partialOrUpdater };

      // Deep-merge profile if present
      if (
        typeof partialOrUpdater === 'object' &&
        partialOrUpdater.profile &&
        prev?.profile
      ) {
        updated.profile = { ...prev.profile, ...partialOrUpdater.profile };
      }

      // Re-persist to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...parsed, user: updated })
          );
        } catch {
          // ignore
        }
      }

      return updated;
    });
  };

  /**
   * Clear session and log out
   */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
