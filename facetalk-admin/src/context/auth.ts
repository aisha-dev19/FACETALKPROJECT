import { createContext, useContext } from "react";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "admin";
};

export type AuthContextValue = {
  user: AdminUser | null;
  // true while we check whether the browser already has a valid admin login
  loading: boolean;
  // returns an error message, or null when it worked
  login: (identifier: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return value;
}