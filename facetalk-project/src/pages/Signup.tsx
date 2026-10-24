import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/auth";

const inputClass =
  "h-12.5 w-full rounded-md border border-[#705a5a] px-3 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black";

type Redirect = { from?: string; service?: string };

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as Redirect | null) ?? {};

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);
    const problem = await signup(username.trim(), email.trim(), password);
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
        <h1 className="text-5xl font-normal leading-tight text-black">
          Sign Up
        </h1>

        {redirect.from === "/booking" && (
          <p className="mt-4 text-lg text-slate-600">
            Create an account to book your appointment.
          </p>
        )}

        <form
          className="mt-10 rounded-md border border-[#d9d9d9] px-7 py-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="signup-username"
                className="mb-3 block text-xl text-slate-600"
              >
                Username <span className="text-red-700">*</span>
              </label>
              <input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                pattern="[a-zA-Z0-9_]{3,30}"
                title="3 to 30 characters: letters, numbers and underscores only"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
              <p className="mt-2 text-sm text-slate-500">
                3 to 30 characters: letters, numbers and underscores.
              </p>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-3 block text-xl text-slate-600"
              >
                Email address <span className="text-red-700">*</span>
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <PasswordField
              id="signup-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              minLength={8}
            />

            <PasswordField
              id="signup-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p role="alert" className="mt-5 text-base text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 min-w-30.25 bg-black px-8 py-4 font-semibold text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </button>

          <p className="mt-5 text-xl text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              state={location.state}
              className="text-[#5268ff] hover:underline"
            >
              Log in
            </Link>
          </p>

          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-500">
            Your information will be kept secure and used to create and manage
            your FACETALK account. By signing up, you agree to our{" "}
            <Link to="/privacy" className="text-[#5268ff] hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className="text-[#5268ff] hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </form>
      </div>
    </main>
  );
}

export default Signup;