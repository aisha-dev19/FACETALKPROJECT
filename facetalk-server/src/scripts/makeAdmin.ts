import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  // Second word is optional: "client" removes admin rights, anything else makes an admin
  const role = process.argv[3] === "client" ? "client" : "admin";

  if (!email) {
    console.error("Usage: npm run make-admin -- email@example.com [client]");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate({ email }, { role }, { returnDocument: "after" });

  if (!user) {
    console.error(
      "No user with that email. They need to sign up on the site first.",
    );
  } else {
    console.log(
      `${user.username} is now ${role === "admin" ? "an admin" : "a client"}.`,
    );
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
