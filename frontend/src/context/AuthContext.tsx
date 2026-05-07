import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthUser = {
  id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
};

const AUTH_SESSION_KEY = "drive_auth_session";
const AUTH_USERS_KEY = "drive_auth_users";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => null,
  logout: () => {},
  register: async () => null,
});

function getStoredUsers() {
  const raw = localStorage.getItem(AUTH_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setStoredUsers(users: Array<Record<string, any>>) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setSession(session: { user: AuthUser }) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = getSession();
    if (saved?.user) {
      setUser(saved.user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find(
      (item: any) => item.email.toLowerCase() === normalizedEmail,
    );

    if (!existing || existing.password !== password) {
      throw new Error("Email or password is incorrect.");
    }

    const session = {
      user: { id: existing.id, name: existing.name, email: existing.email },
    };
    setUser(session.user);
    setSession(session);

    return session.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find(
      (item: any) => item.email.toLowerCase() === normalizedEmail,
    );

    if (existing) {
      throw new Error("A user with that email already exists.");
    }

    const newUser = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim() || "User",
      email: normalizedEmail,
      password,
    };

    users.push(newUser);
    setStoredUsers(users);

    const session = {
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    };
    setUser(session.user);
    setSession(session);

    return session.user;
  };

  const logout = () => {
    setUser(null);
    clearSession();
    navigate("/");
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      register,
    }),
    [user],
  );

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center">Loading…</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
