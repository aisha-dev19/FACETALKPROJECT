import { Router } from "express";
import { isValidObjectId } from "mongoose";
import type { Types } from "mongoose";
import { Booking } from "../models/Booking";
import type { BookingDoc } from "../models/Booking";
import { User } from "../models/User";
import { requireAdmin } from "../middleware/adminAuth";
import { isRealDate, lagosToday, slotStart } from "../utils/booking";
import { Message } from "../models/Message";
import type { MessageDoc } from "../models/Message";

const router = Router();

// Every route in this file needs an admin session
router.use(requireAdmin);

const PAGE_SIZE = 15;

type Owner = { username: string; email: string };

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "2026-10-23" + 6 days = "2026-10-29"
function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function startMs(booking: { date: string; time: string }) {
  return slotStart(booking.date, booking.time).getTime();
}

// Looks up the account behind each booking in one query
async function ownersFor(bookings: BookingDoc[]) {
  const users = await User.find({
    _id: { $in: bookings.map((b) => b.user) },
  }).select("username email");

  return new Map<string, Owner>(
    users.map((u) => [
      u._id.toString(),
      { username: u.username, email: u.email },
    ]),
  );
}

function toRow(booking: BookingDoc, owners: Map<string, Owner>) {
  const owner = owners.get(booking.user.toString());

  return {
    id: booking._id.toString(),
    services: booking.services,
    date: booking.date,
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    status: booking.status,
    createdAt: booking.createdAt.getTime(),
    username: owner?.username ?? "deleted account",
    email: owner?.email ?? "",
  };
}

// Numbers and lists for the dashboard
router.get("/dashboard", async (_req, res) => {
  const today = lagosToday();
  const weekEnd = addDays(today, 6);

  const [todayBookings, laterBookings, thisWeek, upcoming, clients] =
    await Promise.all([
      Booking.find({ date: today, status: "booked" }),
      // At most 10 bookings fit in a day, so 30 always contains the next 5
      Booking.find({ date: { $gt: today }, status: "booked" })
        .sort({ date: 1 })
        .limit(30),
      Booking.countDocuments({
        date: { $gte: today, $lte: weekEnd },
        status: "booked",
      }),
      Booking.countDocuments({ date: { $gte: today }, status: "booked" }),
      User.countDocuments({ role: "client" }),
    ]);

  todayBookings.sort((a, b) => startMs(a) - startMs(b));
  laterBookings.sort((a, b) => startMs(a) - startMs(b));
  const nextBookings = laterBookings.slice(0, 5);

  const owners = await ownersFor([...todayBookings, ...nextBookings]);

  res.json({
    today,
    stats: { today: todayBookings.length, thisWeek, upcoming, clients },
    todayBookings: todayBookings.map((b) => toRow(b, owners)),
    nextBookings: nextBookings.map((b) => toRow(b, owners)),
  });
});

// All bookings, with filters.
//   when:   upcoming (default) | past | all
//   status: all (default) | booked | cancelled
//   date:   one exact day, like 2026-10-30 (overrides "when")
//   search: matches name, phone, service, username or email
//   page:   1, 2, 3 ...
router.get("/bookings", async (req, res) => {
  const when = String(req.query.when ?? "upcoming");
  const status = String(req.query.status ?? "all");
  const date = String(req.query.date ?? "");
  const search = String(req.query.search ?? "").trim().slice(0, 50);
  const page = Math.max(1, Number(req.query.page) || 1);

  // any: the filter is built up from several optional pieces
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (status === "booked" || status === "cancelled") {
    filter.status = status;
  }

  const today = lagosToday();
  if (isRealDate(date)) {
    filter.date = date;
  } else if (when === "upcoming") {
    filter.date = { $gte: today };
  } else if (when === "past") {
    filter.date = { $lt: today };
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const matchingUsers = await User.find({
      $or: [{ username: pattern }, { email: pattern }],
    }).select("_id");

    filter.$or = [
      { name: pattern },
      { phone: pattern },
      { services: pattern },
      { user: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const bookings = await Booking.find(filter);

  // Upcoming and single-day lists read earliest first; history reads newest first
  const newestFirst = !isRealDate(date) && when !== "upcoming";
  bookings.sort((a, b) =>
    newestFirst ? startMs(b) - startMs(a) : startMs(a) - startMs(b),
  );

  const total = bookings.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const owners = await ownersFor(items);

  res.json({
    bookings: items.map((b) => toRow(b, owners)),
    total,
    page,
    pages,
  });
});

// The admin can cancel any booking, with no 2-hour limit
router.patch("/bookings/:id/cancel", async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(404).json({ message: "Booking not found." });
    return;
  }

  const booking = await Booking.findOne({ _id: id, status: "booked" });

  if (!booking) {
    res
      .status(404)
      .json({ message: "Booking not found, or it is already cancelled." });
    return;
  }

  booking.status = "cancelled";
  await booking.save();

  const owners = await ownersFor([booking]);
  res.json({ booking: toRow(booking, owners) });
});

// Everyone with a client account, and how many active bookings each has
router.get("/clients", async (_req, res) => {
  const clients = await User.find({ role: "client" })
    .sort({ createdAt: -1 })
    .limit(500);

  const counts = await Booking.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { status: "booked" } },
    { $group: { _id: "$user", total: { $sum: 1 } } },
  ]);
  const totals = new Map(counts.map((c) => [c._id.toString(), c.total]));

  res.json({
    clients: clients.map((c) => ({
      id: c._id.toString(),
      username: c.username,
      email: c.email,
      joined: c.createdAt.getTime(),
      bookings: totals.get(c._id.toString()) ?? 0,
    })),
  });
});

function toMessageRow(message: MessageDoc) {
  return {
    id: message._id.toString(),
    name: message.name,
    phone: message.phone,
    email: message.email,
    message: message.message,
    read: message.read,
    createdAt: message.createdAt.getTime(),
  };
}

// For the little number on the sidebar
router.get("/messages/unread-count", async (_req, res) => {
  res.json({ count: await Message.countDocuments({ read: false }) });
});

// filter: all (default) | unread
router.get("/messages", async (req, res) => {
  const filter = String(req.query.filter ?? "all");
  const page = Math.max(1, Number(req.query.page) || 1);
  const query = filter === "unread" ? { read: false } : {};

  const [total, unread, items] = await Promise.all([
    Message.countDocuments(query),
    Message.countDocuments({ read: false }),
    Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
  ]);

  res.json({
    messages: items.map(toMessageRow),
    total,
    unread,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
});

router.patch("/messages/:id/read", async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(404).json({ message: "Message not found." });
    return;
  }

  const message = await Message.findByIdAndUpdate(
    id,
    { read: req.body?.read === true },
    { returnDocument: "after" },
  );

  if (!message) {
    res.status(404).json({ message: "Message not found." });
    return;
  }

  res.json({ message: toMessageRow(message) });
});

router.delete("/messages/:id", async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(404).json({ message: "Message not found." });
    return;
  }

  const deleted = await Message.findByIdAndDelete(id);

  if (!deleted) {
    res.status(404).json({ message: "Message not found." });
    return;
  }

  res.json({ message: "Message deleted." });
});

export default router;