import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import type { AuthUser } from "../services/authService";

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {
    throw new Error("AuthProvider missing");
  },
  register: async () => {
    throw new Error("AuthProvider missing");
  },
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount: ask the backend who the current user is using the HTTP-only cookie.
  // This is what persists login across refreshes — no localStorage involved.
  const refresh = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // After register, log the user in so the cookie gets issued.
    await authService.register(name, email, password);
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      navigate("/sign-in", { replace: true });
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  );

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center">Loading…</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

