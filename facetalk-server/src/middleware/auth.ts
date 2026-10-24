import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import type { Role, UserDoc } from "../models/User";
import { COOKIE_NAME, verifyToken } from "../utils/auth";

// Lets us write req.currentUser in route handlers
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserDoc;
    }
  }
}

// Blocks the request unless a valid login cookie is present
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    res.status(401).json({ message: "Please log in." });
    return;
  }

  let user: UserDoc | null = null;
  try {
    const userId = verifyToken(token);
    user = await User.findById(userId);
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

  req.currentUser = user;
  next();
}

// Use after requireAuth: only lets the listed roles through
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      res
        .status(403)
        .json({ message: "You do not have permission to do that." });
      return;
    }
    next();
  };
}