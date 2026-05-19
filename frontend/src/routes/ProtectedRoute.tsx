import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any private route so unauthenticated users get bounced to /sign-in.
 * The current location is preserved so we can redirect them back after login.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
