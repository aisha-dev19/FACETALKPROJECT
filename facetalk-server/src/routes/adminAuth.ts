import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import type { UserDoc } from "../models/User";
import { requireAdmin } from "../middleware/adminAuth";
import {
  clearAdminCookie,
  setAdminCookie,
  signAdminToken,
} from "../utils/auth";

const router = Router();

function adminUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

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

  // Same message whether the account is missing, the password is wrong, or
  // the account is simply not an admin, so nothing is revealed
  if (!user || !passwordOk || user.role !== "admin") {
    res.status(401).json({ message: "Invalid username/email or password." });
    return;
  }

  setAdminCookie(res, signAdminToken(user._id.toString()));
  res.json({ user: adminUser(user) });
});

router.post("/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ message: "Logged out." });
});

// The admin app asks this when it loads
router.get("/me", requireAdmin, (req, res) => {
  res.json({ user: adminUser(req.currentUser!) });
});

export default router;