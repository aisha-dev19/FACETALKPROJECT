import { Router } from "express";
import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Booking } from "../models/Booking";
import type { BookingDoc } from "../models/Booking";
import { requireAuth } from "../middleware/auth";
import { serviceNames } from "../data/services";
import {
  CHANGE_WINDOW_HOURS,
  CHANGE_WINDOW_MS,
  isRealDate,
  slotStart,
  validateSlot,
} from "../utils/booking";

const router = Router();

const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;

// What we send to the browser
function publicBooking(booking: BookingDoc) {
  const createdAt = booking.createdAt.getTime();

  return {
    id: booking._id.toString(),
    services: booking.services,
    date: booking.date,
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    createdAt,
    changeableUntil: createdAt + CHANGE_WINDOW_MS,
  };
}

function isDuplicateKey(error: unknown) {
  return (error as { code?: number }).code === 11000;
}

function windowClosed(booking: BookingDoc) {
  return Date.now() - booking.createdAt.getTime() > CHANGE_WINDOW_MS;
}

const SLOT_TAKEN = "Sorry, that time was just taken. Please choose another.";

// Finds the booking in the URL, but only if it belongs to the logged-in user.
// Sends the error reply itself and returns null when there is no such booking.
async function findOwnBooking(
  req: Request,
  res: Response,
): Promise<BookingDoc | null> {
  const id = req.params.id;

  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(404).json({ message: "Booking not found." });
    return null;
  }

  const booking = await Booking.findOne({
    _id: id,
    user: req.currentUser!._id,
    status: "booked",
  });

  if (!booking) {
    res.status(404).json({ message: "Booking not found." });
    return null;
  }

  return booking;
}

// Which times are already taken on a date? Contains no personal details.
router.get("/taken", async (req, res) => {
  const date = String(req.query.date ?? "");

  if (!isRealDate(date)) {
    res.status(400).json({ message: "Please pick a valid date." });
    return;
  }

  const filter: Record<string, unknown> = { date, status: "booked" };

  // When rescheduling, the booking's own slot should not count as taken
  const exclude = req.query.exclude;
  if (typeof exclude === "string" && isValidObjectId(exclude)) {
    filter._id = { $ne: exclude };
  }

  const bookings = await Booking.find(filter).select("time");
  res.json({ times: bookings.map((b) => b.time) });
});

// The logged-in user's own bookings
router.get("/mine", requireAuth, async (req, res) => {
  const bookings = await Booking.find({
    user: req.currentUser!._id,
    status: "booked",
  });

  bookings.sort(
    (a, b) =>
      slotStart(a.date, a.time).getTime() - slotStart(b.date, b.time).getTime(),
  );

  res.json({ bookings: bookings.map(publicBooking) });
});

router.post("/", requireAuth, async (req, res) => {
  const body = req.body ?? {};

  const services: string[] = Array.isArray(body.services)
    ? [...new Set<string>(body.services.map(String))]
    : [];
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (services.length === 0 || !services.every((s) => serviceNames.includes(s))) {
    res.status(400).json({ message: "Please choose at least one service." });
    return;
  }

  const slotProblem = validateSlot(date, time);
  if (slotProblem) {
    res.status(400).json({ message: slotProblem });
    return;
  }

  if (name.length < 2 || name.length > 100) {
    res.status(400).json({ message: "Please enter your full name." });
    return;
  }
  if (!PHONE_RE.test(phone)) {
    res.status(400).json({ message: "Please enter a valid phone number." });
    return;
  }

  try {
    const booking = await Booking.create({
      user: req.currentUser!._id,
      services,
      date,
      time,
      name,
      phone,
    });
    res.status(201).json({ booking: publicBooking(booking) });
  } catch (error) {
    if (isDuplicateKey(error)) {
      res.status(409).json({ message: SLOT_TAKEN });
      return;
    }
    throw error;
  }
});

// Reschedule
router.patch("/:id", requireAuth, async (req, res) => {
  const booking = await findOwnBooking(req, res);
  if (!booking) return;

  if (windowClosed(booking)) {
    res.status(403).json({
      message: `The ${CHANGE_WINDOW_HOURS}-hour window to change this booking has passed. Please contact the salon.`,
    });
    return;
  }

  const body = req.body ?? {};
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();

  const slotProblem = validateSlot(date, time);
  if (slotProblem) {
    res.status(400).json({ message: slotProblem });
    return;
  }

  booking.date = date;
  booking.time = time;

  try {
    await booking.save();
    res.json({ booking: publicBooking(booking) });
  } catch (error) {
    if (isDuplicateKey(error)) {
      res.status(409).json({ message: SLOT_TAKEN });
      return;
    }
    throw error;
  }
});

// Cancel
router.delete("/:id", requireAuth, async (req, res) => {
  const booking = await findOwnBooking(req, res);
  if (!booking) return;

  if (windowClosed(booking)) {
    res.status(403).json({
      message: `The ${CHANGE_WINDOW_HOURS}-hour window to change this booking has passed. Please contact the salon.`,
    });
    return;
  }

  booking.status = "cancelled";
  await booking.save();
  res.json({ message: "Booking cancelled." });
});

export default router;