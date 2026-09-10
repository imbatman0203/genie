import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask backend "am I logged in?"
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await auth.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await auth.login({ email, password });
    // Re-fetch profile to get full user object consistently
    const me = await auth.me();
    setUser(me);
    return data;
  };

  const signup = async (payload) => {
    const data = await auth.signup(payload);
    const me = await auth.me();
    setUser(me);
    return data;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthed: !!user,
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}