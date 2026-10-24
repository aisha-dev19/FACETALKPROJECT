// One booking, as the server sends it to the admin
export type BookingRow = {
  id: string;
  services: string[];
  date: string; // "2026-10-30"
  time: string; // "2:00 PM"
  name: string;
  phone: string;
  status: "booked" | "cancelled";
  createdAt: number;
  username: string;
  email: string;
};

function toDate(date: string) {
  return new Date(`${date}T00:00:00`);
}


// "Saturday, 24 October 2026"
export function formatLongDate(date: string) {
  return toDate(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "Fri, 30 Oct 2026"
export function formatDate(date: string) {
  return toDate(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "Fri, 30 Oct"
export function formatShortDate(date: string) {
  return toDate(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// "4 Oct 2026"
export function formatJoined(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "24 Oct 2026, 3:45 pm"
export function formatSent(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Opens a WhatsApp chat. Numbers starting with 0 become Nigerian (234) numbers.
export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}