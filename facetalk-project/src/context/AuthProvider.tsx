import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import { AuthContext } from "./auth";
import type { AuthContextValue, User } from "./auth";

function messageFrom(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the server whether this browser is already logged in
  useEffect(() => {
    let cancelled = false;

    api<{ user: User }>("/api/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signup: AuthContextValue["signup"] = async (
    username,
    email,
    password,
  ) => {
    try {
      const data = await api<{ user: User }>("/api/auth/signup", {
        method: "POST",
        body: { username, email, password },
      });
      setUser(data.user);
      return null;
    } catch (error) {
      return messageFrom(error);
    }
  };

  const login: AuthContextValue["login"] = async (
    identifier,
    password,
    remember,
  ) => {
    try {
      const data = await api<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: { identifier, password, remember },
      });
      setUser(data.user);
      return null;
    } catch (error) {
      return messageFrom(error);
    }
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // if the server can't be reached we still log out on this screen
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}