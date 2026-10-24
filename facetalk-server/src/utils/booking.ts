export const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

// Clients can cancel or reschedule for this many hours after booking
export const CHANGE_WINDOW_HOURS = 2;
export const CHANGE_WINDOW_MS = CHANGE_WINDOW_HOURS * 60 * 60 * 1000;

export function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));

  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}

// The exact moment a slot starts. Lagos is UTC+1 all year (no daylight
// saving), so "+01:00" is always right for the salon.
export function slotStart(date: string, time: string): Date {
  const [clock, period] = time.split(" ");
  const [h, m] = clock.split(":").map(Number);

  let hour = h % 12;
  if (period === "PM") hour += 12;

  const hh = String(hour).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return new Date(`${date}T${hh}:${mm}:00+01:00`);
}

// Returns an error message, or null when the date and time are fine
export function validateSlot(date: string, time: string): string | null {
  if (!isRealDate(date)) return "Please pick a valid date.";
  if (!timeSlots.includes(time)) return "Please pick a valid time.";
  if (slotStart(date, time).getTime() <= Date.now()) {
    return "That time has already passed. Please pick a later time.";
  }
  return null;
}


// Today's date in Lagos (UTC+1), like "2026-10-23"
export function lagosToday(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
}