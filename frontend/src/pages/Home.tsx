import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.name || user?.email || "there";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Simple file drive</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Welcome to Drive</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A clean and light landing page with sign in and sign out support built without Clerk.
              </p>
            </div>

            {isAuthenticated ? (
              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-lg font-medium text-slate-900">Hello, {displayName}.</p>
                <p className="mt-2 text-slate-600">
                  You are signed in. Go to the dashboard or sign out when you are done.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Open Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-lg font-medium text-slate-900">Sign in to start using the app.</p>
                <p className="mt-2 text-slate-600">
                  Enter your email and password manually to sign in or create a new account.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/sign-in"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
