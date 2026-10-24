import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/auth";

export default function Login() {
  const { user, loading, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in: go straight to the dashboard
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const problem = await login(identifier.trim(), password);

    setSubmitting(false);
    if (problem) setError(problem);
    // on success, `user` is set and the check above redirects to the dashboard
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel (large screens only) */}
      <div className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div>
          <p className="text-2xl font-bold tracking-wide">FACETALK</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-pink-400">
            Admin
          </p>
        </div>

        <div>
          <h1 className="text-4xl font-semibold leading-tight">
            Run your salon,
            <br />
            beautifully.
          </h1>
          <p className="mt-4 max-w-md leading-7 text-slate-400">
            See today's appointments, manage bookings and keep track of your
            clients, all in one place.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} FACETALK Salon
        </p>
      </div>

      {/* Right: the form */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <p className="mb-8 text-xl font-bold tracking-wide text-slate-900 lg:hidden">
            FACETALK <span className="text-pink-600">Admin</span>
          </p>

          <h2 className="text-3xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500">Log in to the admin area.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username or email
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 pr-12 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
                >
                  {visible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-md bg-slate-900 font-medium text-white transition hover:bg-pink-600 disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}