import { Schema, model } from "mongoose";
import type { HydratedDocument, Types } from "mongoose";

export type BookingStatus = "booked" | "cancelled";

export interface IBooking {
  user: Types.ObjectId;
  services: string[];
  date: string; // "2026-10-30"
  time: string; // "2:00 PM"
  name: string;
  phone: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDoc = HydratedDocument<IBooking>;

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    services: { type: [String], required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
  },
  { timestamps: true },
);

// Only one ACTIVE booking per date and time. Cancelled ones don't count,
// so a cancelled slot can be booked again.
bookingSchema.index(
  { date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } },
);

export const Booking = model<IBooking>("Booking", bookingSchema);