import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import type { UserDoc } from "../models/User";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../utils/auth";

// Blocks the request unless the admin cookie is valid AND the account is an admin
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ message: "Please log in." });
    return;
  }

  let user: UserDoc | null = null;
  try {
    user = await User.findById(verifyAdminToken(token));
  } catch {
    res
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
    return;
  }

  if (!user) {
    res.status(401).json({ message: "Please log in." });
    return;
  }

  // The role is read from the database every time, so removing someone's
  // admin rights takes effect immediately.
  if (user.role !== "admin") {
    res.status(403).json({ message: "You do not have permission to do that." });
    return;
  }

  req.currentUser = user;
  next();
}