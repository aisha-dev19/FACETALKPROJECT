import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError, setUnauthorizedHandler } from "../lib/api";
import { AuthContext } from "./auth";
import type { AdminUser, AuthContextValue } from "./auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the server whether this browser already has an admin login
  useEffect(() => {
    let cancelled = false;

    api<{ user: AdminUser }>("/api/admin/auth/me")
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

  // If any later request finds the session has ended, clearing the user makes
  // AdminLayout send the admin back to the login page
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login: AuthContextValue["login"] = async (identifier, password) => {
    try {
      const data = await api<{ user: AdminUser }>("/api/admin/auth/login", {
        method: "POST",
        body: { identifier, password },
      });
      setUser(data.user);
      return null;
    } catch (error) {
      return error instanceof ApiError
        ? error.message
        : "Something went wrong. Please try again.";
    }
  };

  const logout = async () => {
    try {
      await api("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // if the server can't be reached we still log out on this screen
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}