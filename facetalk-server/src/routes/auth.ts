import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import type { UserDoc } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/auth";

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// What we send to the browser: never the password hash
function publicUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

router.post("/signup", async (req, res) => {
  const body = req.body ?? {};
  // String(...) also blocks tricks like sending {"$gt": ""} instead of text
  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!USERNAME_RE.test(username)) {
    res.status(400).json({
      message:
        "Username must be 3 to 30 characters: letters, numbers and underscores only.",
    });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ message: "Please enter a valid email address." });
    return;
  }
  if (password.length < 8 || password.length > 72) {
    res
      .status(400)
      .json({ message: "Password must be between 8 and 72 characters." });
    return;
  }

  const taken = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });
  if (taken) {
    res.status(409).json({
      message: "An account with that username or email already exists.",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({ username, email, passwordHash });
    setAuthCookie(res, signToken(user._id.toString()));
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    // Two signups at the same moment can both pass the check above;
    // the database's unique index catches the second one (error code 11000)
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        message: "An account with that username or email already exists.",
      });
      return;
    }
    throw error;
  }
});

router.post("/login", async (req, res) => {
  const body = req.body ?? {};
  const identifier = String(body.identifier ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!identifier || !password) {
    res
      .status(400)
      .json({ message: "Please enter your username or email and password." });
    return;
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).select("+passwordHash");

  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  // Same message for "no such user" and "wrong password", so nobody can
  // use the form to find out which usernames or emails exist
  if (!user || !passwordOk) {
    res
      .status(401)
      .json({ message: "Invalid username/email or password." });
    return;
  }

  setAuthCookie(res, signToken(user._id.toString()), body.remember === true);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
});

// Who is logged in right now? The website asks this when it loads.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.currentUser!) });
});

export default router;