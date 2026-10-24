import { createContext, useContext } from "react";

export type User = {
  id: string;
  username: string;
  email: string;
  role: "client" | "admin";
};

export type AuthContextValue = {
  user: User | null;
  // true while we check whether the browser already has a valid login
  loading: boolean;
  // signup and login return an error message, or null when it worked
  signup: (
    username: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  login: (
    identifier: string,
    password: string,
    remember: boolean,
  ) => Promise<string | null>;
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