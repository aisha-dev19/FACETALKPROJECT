import { Schema, model } from "mongoose";
import type { HydratedDocument } from "mongoose";

export type Role = "client" | "admin";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDoc = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // select: false means queries leave this out unless we ask for it
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["client", "admin"], default: "client" },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}