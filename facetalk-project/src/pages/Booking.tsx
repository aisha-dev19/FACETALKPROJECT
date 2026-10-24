import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "../data/services";
import { useAuth } from "../context/auth";
import { api, ApiError } from "../lib/api";
import PageHero from "../components/PageHero";
import styling1 from "../assets/images/styling1.jpg";

type MyBooking = {
  id: string;
  services: string[];
  date: string;
  time: string;
  name: string;
  phone: string;
  createdAt: number;
  changeableUntil: number; // moment when cancel / reschedule closes
};

// Which times are taken for one date (key identifies which date it was for)
type TakenTimes = { key: string; times: string[] };

// Only used for wording on this page. The server enforces the real rule.
const CHANGE_WINDOW_HOURS = 2;

const timeSlots = [
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

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The exact moment a slot starts. Lagos is UTC+1 all year, the same
// assumption the server makes.
function slotStartMs(date: string, slot: string) {
  const [clock, period] = slot.split(" ");
  const [h, m] = clock.split(":").map(Number);

  let hour = h % 12;
  if (period === "PM") hour += 12;

  const hh = String(hour).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return new Date(`${date}T${hh}:${mm}:00+01:00`).getTime();
}

function canChange(booking: MyBooking, now: number) {
  return now <= booking.changeableUntil;
}

// How long until changes close, in hours and minutes
function timeLeftText(booking: MyBooking, now: number) {
  const minutes = Math.max(
    0,
    Math.ceil((booking.changeableUntil - now) / 60000),
  );

  const h = Math.floor(minutes / 60);
  return h > 0 ? `${h}h ${minutes % 60}m` : `${minutes}m`;
}

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

type TimeSlotPickerProps = {
  date: string;
  now: number;
  bookedTimes: string[];
  value: string;
  onChange: (slot: string) => void;
};

function TimeSlotPicker({
  date,
  now,
  bookedTimes,
  value,
  onChange,
}: TimeSlotPickerProps) {
  const allPast = timeSlots.every((slot) => slotStartMs(date, slot) <= now);

  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {timeSlots.map((slot) => {
        const isPast = slotStartMs(date, slot) <= now;
        const isBooked = bookedTimes.includes(slot);
        const isChosen = value === slot;

        let style = "border-gray-300 bg-white hover:border-black";
        if (isChosen) {
          style = "border-pink-600 bg-pink-600 text-white";
        } else if (isPast) {
          style = "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300";
        } else if (isBooked) {
          style =
            "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through";
        }

        return (
          <button
            key={slot}
            type="button"
            disabled={isPast || isBooked}
            title={
              isPast
                ? "This time has passed"
                : isBooked
                  ? "Already booked"
                  : undefined
            }
            onClick={() => onChange(slot)}
            className={`rounded-md border px-2 py-2 text-sm transition ${style}`}
          >
            {slot}
          </button>
        );
      })}

      {allPast && (
        <p className="col-span-3 text-sm text-gray-600">
          No more times on this day. Please pick another date.
        </p>
      )}
    </div>
  );
}

export default function Booking() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const resultRef = useRef<HTMLDivElement>(null);

  // This account's bookings (tagged with whose they are, so a different
  // account never sees them)
  const [loaded, setLoaded] = useState<{
    userId: string;
    items: MyBooking[];
  } | null>(null);
  const myBookings = user && loaded?.userId === user.id ? loaded.items : [];

  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [now, setNow] = useState(() => Date.now());
  // bump this number to re-ask the server which times are taken
  const [refresh, setRefresh] = useState(0);

  // If the visitor came from the Services page, that service starts ticked
  const [selected, setSelected] = useState<string[]>(() => {
    const preselected = (location.state as { service?: string } | null)?.service;
    return preselected ? [preselected] : [];
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [takenFor, setTakenFor] = useState<TakenTimes | null>(null);
  const takenTimes = takenFor?.key === date ? takenFor.times : [];

  // reschedule panel state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rDate, setRDate] = useState("");
  const [rTime, setRTime] = useState("");
  const [rError, setRError] = useState("");
  const [rSaving, setRSaving] = useState(false);

  const [rTakenFor, setRTakenFor] = useState<TakenTimes | null>(null);
  const rKey = `${rescheduleId}|${rDate}`;
  const rTakenTimes = rTakenFor?.key === rKey ? rTakenFor.times : [];

  // keep "now" fresh so buttons and past times update on their own
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // load this account's bookings from the server
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    api<{ bookings: MyBooking[] }>("/api/bookings/mine")
      .then((data) => {
        if (cancelled) return;
        setLoaded({ userId: user.id, items: data.bookings });
        setLoadError("");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // which times are taken on the date chosen in the booking form
  useEffect(() => {
    if (!user || !date) return;
    let cancelled = false;

    api<{ times: string[] }>(`/api/bookings/taken?date=${date}`)
      .then((data) => {
        if (!cancelled) setTakenFor({ key: date, times: data.times });
      })
      .catch(() => {
        // the picker just shows every time as free; the server still checks
      });

    return () => {
      cancelled = true;
    };
  }, [user, date, refresh]);

  // which times are taken on the date chosen while rescheduling
  useEffect(() => {
    if (!user || !rescheduleId || !rDate) return;
    let cancelled = false;

    api<{ times: string[] }>(
      `/api/bookings/taken?date=${rDate}&exclude=${rescheduleId}`,
    )
      .then((data) => {
        if (!cancelled) {
          setRTakenFor({ key: `${rescheduleId}|${rDate}`, times: data.times });
        }
      })
      .catch(() => {
        // same as above
      });

    return () => {
      cancelled = true;
    };
  }, [user, rescheduleId, rDate, refresh]);

  // after a booking, scroll up to the confirmation and the new booking card
  useEffect(() => {
    if (confirmed) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [confirmed]);

  function updateMine(change: (items: MyBooking[]) => MyBooking[]) {
    if (!user) return;
    setLoaded({ userId: user.id, items: change(myBookings) });
  }

  function toggleService(serviceName: string) {
    setSelected((current) =>
      current.includes(serviceName)
        ? current.filter((s) => s !== serviceName)
        : [...current, serviceName],
    );
  }

  function handleDateChange(value: string) {
    setDate(value);
    setTime("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmed(false);

    if (selected.length === 0) {
      setError("Please choose at least one service.");
      return;
    }
    if (!date || !time) {
      setError("Please pick a date and a time.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = await api<{ booking: MyBooking }>("/api/bookings", {
        method: "POST",
        body: {
          services: selected,
          date,
          time,
          name: name.trim(),
          phone: phone.trim(),
        },
      });

      updateMine((items) => [...items, data.booking]);
      setSelected([]);
      setDate("");
      setTime("");
      setName("");
      setPhone("");
      setNow(Date.now());
      setConfirmed(true);
    } catch (err) {
      setError(errorMessage(err));
      setRefresh((n) => n + 1); // the slot may have just been taken
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelBooking(booking: MyBooking) {
    if (!window.confirm("Cancel this appointment?")) return;

    setActionError("");

    try {
      await api(`/api/bookings/${booking.id}`, { method: "DELETE" });
      updateMine((items) => items.filter((b) => b.id !== booking.id));
      if (rescheduleId === booking.id) setRescheduleId(null);
      setRefresh((n) => n + 1);
    } catch (err) {
      setActionError(errorMessage(err));
      setNow(Date.now());
    }
  }

  function startReschedule(booking: MyBooking) {
    setRescheduleId(booking.id);
    setRDate(booking.date);
    setRTime(booking.time);
    setRError("");
  }

  async function saveReschedule(booking: MyBooking) {
    if (!rDate || !rTime) {
      setRError("Please pick a date and a time.");
      return;
    }

    setRError("");
    setRSaving(true);

    try {
      const data = await api<{ booking: MyBooking }>(
        `/api/bookings/${booking.id}`,
        { method: "PATCH", body: { date: rDate, time: rTime } },
      );
      updateMine((items) =>
        items.map((b) => (b.id === booking.id ? data.booking : b)),
      );
      setRescheduleId(null);
      setRefresh((n) => n + 1);
    } catch (err) {
      setRError(errorMessage(err));
      setRefresh((n) => n + 1);
    } finally {
      setRSaving(false);
    }
  }

  // earliest first
  const sortedBookings = [...myBookings].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time),
  );

  return (
    <main>
      <PageHero
        image={styling1}
        label="Book Now"
        title="Book Your Appointment"
      />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="mb-10 max-w-2xl leading-7 text-gray-600">
          Select one or more services, pick a date and time that suits you, and
          we'll have you booked in.
        </p>

        {/* Confirmation + the account's own bookings */}
        <div ref={resultRef} className="scroll-mt-6">
          {confirmed && (
            <p className="mb-8 rounded-md bg-green-50 p-4 text-sm text-green-800">
              Your appointment is booked. You can cancel or reschedule it below
              for the next {CHANGE_WINDOW_HOURS} hours.
            </p>
          )}

          {loadError && (
            <p className="mb-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </p>
          )}

          {sortedBookings.length > 0 && (
            <section className="mb-14">
              <h2 className="border-b border-black/20 pb-3 text-2xl font-semibold text-black">
                Your booking
              </h2>

              {actionError && (
                <p className="mt-4 text-sm text-red-600">{actionError}</p>
              )}

              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {sortedBookings.map((booking) => {
                  const editable = canChange(booking, now);
                  const isRescheduling = rescheduleId === booking.id;

                  return (
                    <li
                      key={booking.id}
                      className="rounded-md border border-gray-200 bg-white p-5"
                    >
                      <p className="font-semibold text-black">
                        {formatDate(booking.date)} at {booking.time}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {booking.services.join(", ")}
                      </p>

                      {editable ? (
                        <>
                          <p className="mt-3 text-xs text-gray-500">
                            You can cancel or reschedule for another{" "}
                            {timeLeftText(booking, now)}.
                          </p>

                          {!isRescheduling && (
                            <div className="mt-3 flex gap-5 text-sm">
                              <button
                                type="button"
                                onClick={() => startReschedule(booking)}
                                className="font-medium text-black underline underline-offset-4"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelBooking(booking)}
                                className="text-red-600 underline underline-offset-4"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="mt-3 text-xs text-gray-500">
                          The {CHANGE_WINDOW_HOURS}-hour window to cancel or
                          reschedule has passed, so this booking can no longer
                          be changed online. Please contact the salon for any
                          changes.
                        </p>
                      )}

                      {isRescheduling && editable && (
                        <div className="mt-4 space-y-3 rounded-md bg-[#f8f5f2] p-4">
                          <label
                            htmlFor={`rdate-${booking.id}`}
                            className="text-sm font-medium text-black"
                          >
                            New date
                          </label>
                          <input
                            id={`rdate-${booking.id}`}
                            type="date"
                            min={todayString()}
                            value={rDate}
                            onChange={(e) => {
                              setRDate(e.target.value);
                              setRTime("");
                            }}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                          />

                          {rDate && (
                            <TimeSlotPicker
                              date={rDate}
                              now={now}
                              bookedTimes={rTakenTimes}
                              value={rTime}
                              onChange={setRTime}
                            />
                          )}

                          {rError && (
                            <p className="text-sm text-red-600">{rError}</p>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={rSaving}
                              onClick={() => saveReschedule(booking)}
                              className="bg-black px-5 py-2 text-sm text-white transition hover:bg-pink-600 disabled:opacity-60"
                            >
                              {rSaving ? "Saving..." : "Save new time"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRescheduleId(null)}
                              className="px-3 py-2 text-sm text-gray-600 underline underline-offset-4"
                            >
                              Never mind
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          {/* Left: services */}
          <div className="space-y-10">
            {categories.map((category) => (
              <section key={category.title}>
                <h2 className="border-b border-black/20 pb-3 text-2xl font-semibold text-black">
                  {category.title}
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {category.services.map((service) => {
                    const isSelected = selected.includes(service.name);

                    return (
                      <button
                        key={service.name}
                        type="button"
                        onClick={() => toggleService(service.name)}
                        aria-pressed={isSelected}
                        className={`rounded-md border p-5 text-left transition ${
                          isSelected
                            ? "border-pink-600 bg-pink-50"
                            : "border-gray-200 bg-white hover:border-black"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-black">
                            {service.name}
                          </h3>
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                              isSelected
                                ? "bg-pink-600 text-white"
                                : "border border-gray-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {service.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Right: booking form, or the sign-in prompt */}
          {loading ? null : user ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-md bg-[#f8f5f2] p-6 lg:sticky lg:top-24"
            >
              <div>
                <h2 className="text-2xl font-semibold text-black">
                  Book appointment
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Booking as {user.username}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-black">
                  Selected services
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selected.length > 0
                    ? selected.join(", ")
                    : "None yet. Tap a service on the left."}
                </p>
              </div>

              <div>
                <label htmlFor="date" className="text-sm font-medium text-black">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  min={todayString()}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-black">Time</p>
                {!date ? (
                  <p className="mt-1 text-sm text-gray-600">
                    Pick a date first.
                  </p>
                ) : (
                  <TimeSlotPicker
                    date={date}
                    now={now}
                    bookedTimes={takenTimes}
                    value={time}
                    onChange={setTime}
                  />
                )}
              </div>

              <div>
                <label htmlFor="name" className="text-sm font-medium text-black">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-black">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black px-7 py-3 text-white transition hover:bg-pink-600 disabled:opacity-60"
              >
                {submitting ? "Booking..." : "Confirm booking"}
              </button>
            </form>
          ) : (
            <div className="space-y-5 rounded-md bg-[#f8f5f2] p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-semibold text-black">
                Book appointment
              </h2>
              <p className="leading-7 text-gray-600">
                You need an account to book an appointment. Log in if you
                already have one, or create a new account. It only takes a
                minute.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  state={{ from: "/booking", service: selected[0] }}
                  className="bg-black px-6 py-3 text-center text-white transition hover:bg-pink-600"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  state={{ from: "/booking", service: selected[0] }}
                  className="border border-black px-6 py-3 text-center text-black transition hover:bg-black hover:text-white"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}