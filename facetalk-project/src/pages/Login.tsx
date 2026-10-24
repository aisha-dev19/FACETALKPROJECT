import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/auth";

type Redirect = { from?: string; service?: string };

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as Redirect | null) ?? {};

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSubmitting(true);
    const problem = await login(username.trim(), password, remember);
    setSubmitting(false);

    if (problem) {
      setError(problem);
      return;
    }

    // Go back to where the visitor came from (e.g. the booking page)
    navigate(redirect.from ?? "/", {
      replace: true,
      state: redirect.service ? { service: redirect.service } : undefined,
    });
  }

  return (
    <main className="min-h-screen bg-white px-6 pb-12 pt-28 sm:px-[6.7vw]">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-normal leading-tight text-black">Login</h1>

        {redirect.from === "/booking" && (
          <p className="mt-4 text-lg text-slate-600">
            Log in to book your appointment.
          </p>
        )}

        <form
          className="mt-10 rounded-md border border-[#d9d9d9] px-7 py-8 md:min-h-106.25"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="login-username"
                className="mb-3 block text-xl text-slate-600"
              >
                Username or email address{" "}
                <span className="text-red-700">*</span>
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12.5 w-full rounded-md border border-[#705a5a] px-3 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p role="alert" className="mt-5 text-base text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="min-w-30.25 bg-black px-8 py-4 font-semibold text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>

            <label className="flex items-center gap-2 text-xl text-slate-600">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 accent-black"
              />
              Remember me
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              to="/contact"
              className="inline-block w-fit text-xl text-[#5268ff] hover:underline"
            >
              Lost your password?
            </Link>

            <p className="text-xl text-slate-600">
              New here?{" "}
              <Link
                to="/signup"
                state={location.state}
                className="text-[#5268ff] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Login;