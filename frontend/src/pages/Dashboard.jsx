import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Your dashboard</h1>
              <p className="mt-2 text-slate-600">
                A simple dashboard page that is available after manual sign in.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-lg font-medium text-slate-900">Welcome back, {user?.name || user?.email}.</p>
              <p className="mt-2 text-slate-600">Your session is active and can be ended with sign out.</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Back to Home
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
