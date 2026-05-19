import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to create account.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-3 text-sm text-slate-600">Use your email and a password to sign up.</p>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-slate-900 hover:underline">
              Sign in.
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
