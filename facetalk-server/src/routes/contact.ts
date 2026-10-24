import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Message } from "../models/Message";

const router = Router();

const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At most 5 messages per hour from one visitor
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "You have sent several messages recently. Please try again later or call the salon.",
  },
});

const THANKS = "Thank you. Your message has been received and we'll be in touch.";

router.post("/", limiter, async (req, res) => {
  const body = req.body ?? {};

  // A hidden field that real visitors never see. Bots fill it in, so we
  // pretend it worked and save nothing.
  if (String(body.website ?? "").trim() !== "") {
    res.status(201).json({ message: THANKS });
    return;
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 100) {
    res.status(400).json({ message: "Please enter your full name." });
    return;
  }
  if (!PHONE_RE.test(phone)) {
    res.status(400).json({ message: "Please enter a valid phone number." });
    return;
  }
  if (email && !EMAIL_RE.test(email)) {
    res.status(400).json({ message: "Please enter a valid email address." });
    return;
  }
  if (message.length < 5 || message.length > 2000) {
    res
      .status(400)
      .json({ message: "Your message must be between 5 and 2000 characters." });
    return;
  }

  await Message.create({ name, phone, email, message });
  res.status(201).json({ message: THANKS });
});

export default router;