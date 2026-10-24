import jwt from "jsonwebtoken";
import type { Response } from "express";

export const COOKIE_NAME = "token";

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file.");
  }
  return secret;
}

export function signToken(userId: string) {
  return jwt.sign({}, getSecret(), {
    subject: userId,
    expiresIn: SEVEN_DAYS_SECONDS,
  });
}

// Returns the user id stored in the token, or throws if it is invalid or expired
export function verifyToken(token: string): string {
  const payload = jwt.verify(token, getSecret());
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid token");
  }
  return payload.sub;
}

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

export function setAuthCookie(res: Response, token: string, remember = true) {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    // no maxAge means a "session cookie" that is deleted when the browser closes
    ...(remember ? { maxAge: SEVEN_DAYS_SECONDS * 1000 } : {}),
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export const ADMIN_COOKIE_NAME = "admin_token";

const EIGHT_HOURS_SECONDS = 8 * 60 * 60;

export function signAdminToken(userId: string) {
  return jwt.sign({}, getSecret(), {
    subject: userId,
    // A normal client token has no "audience", so it can't be used here
    audience: "facetalk-admin",
    expiresIn: EIGHT_HOURS_SECONDS,
  });
}

export function verifyAdminToken(token: string): string {
  const payload = jwt.verify(token, getSecret(), {
    audience: "facetalk-admin",
  });
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid token");
  }
  return payload.sub;
}

const adminCookieOptions = {
  ...cookieOptions,
  // the browser only sends this cookie to admin routes
  path: "/api/admin",
};

export function setAdminCookie(res: Response, token: string) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    ...adminCookieOptions,
    maxAge: EIGHT_HOURS_SECONDS * 1000,
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, adminCookieOptions);
}