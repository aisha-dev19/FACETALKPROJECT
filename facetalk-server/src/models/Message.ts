import { Schema, model } from "mongoose";
import type { HydratedDocument } from "mongoose";

export interface IMessage {
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDoc = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Message = model<IMessage>("Message", messageSchema);