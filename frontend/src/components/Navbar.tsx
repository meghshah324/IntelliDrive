import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.name || user?.email || "";

  return (
    <header className="border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Drive
          </Link>
          <Link to="/dashboard" className="text-sm text-slate-600 transition hover:text-slate-900">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-700">Signed in as {displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
