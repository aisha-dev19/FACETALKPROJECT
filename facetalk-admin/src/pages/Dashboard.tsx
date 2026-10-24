import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiPhone,
  FiSun,
  FiUsers,
} from "react-icons/fi";
import { api, ApiError } from "../lib/api";
import { formatLongDate, formatShortDate } from "../lib/format";
import type { BookingRow } from "../lib/format";
import { useAuth } from "../context/auth";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";

type DashboardData = {
  today: string;
  stats: { today: number; thisWeek: number; upcoming: number; clients: number };
  todayBookings: BookingRow[];
  nextBookings: BookingRow[];
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SkeletonRows() {
  return (
    <div className="space-y-5 px-5 py-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex gap-4">
          <Skeleton className="h-5 w-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-slate-500">{text}</div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [hello] = useState(greeting);

  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    api<DashboardData>("/api/admin/dashboard")
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setError("");
    setAttempt((n) => n + 1);
  }

  const stats = data?.stats;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {hello}, {user?.username}
        </h1>
        <p className="mt-1 text-slate-500">
          {data
            ? formatLongDate(data.today)
            : "Here is how the salon looks today."}
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-800">
            We couldn't load the dashboard.
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Numbers */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Today"
              value={stats?.today}
              icon={FiSun}
              accent="bg-pink-100 text-pink-600"
            />
            <StatCard
              label="Next 7 days"
              value={stats?.thisWeek}
              icon={FiCalendar}
              accent="bg-sky-100 text-sky-600"
            />
            <StatCard
              label="All upcoming"
              value={stats?.upcoming}
              icon={FiClock}
              accent="bg-amber-100 text-amber-600"
            />
            <StatCard
              label="Clients"
              value={stats?.clients}
              icon={FiUsers}
              accent="bg-emerald-100 text-emerald-600"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            {/* Today */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Today's appointments
                </h2>
                {data && (
                  <span className="text-sm text-slate-500">
                    {data.todayBookings.length} booked
                  </span>
                )}
              </div>

              {!data ? (
                <SkeletonRows />
              ) : data.todayBookings.length === 0 ? (
                <Empty text="No appointments today." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.todayBookings.map((booking) => (
                    <li key={booking.id} className="flex gap-4 px-5 py-4">
                      <p className="w-20 shrink-0 text-sm font-semibold text-pink-600">
                        {booking.time}
                      </p>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {booking.name}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {booking.services.join(", ")}
                        </p>
                        <a
                          href={`tel:${booking.phone}`}
                          className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
                        >
                          <FiPhone size={14} />
                          {booking.phone}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Coming up */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">Coming up next</h2>
                <Link
                  to="/bookings"
                  className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700"
                >
                  View all
                  <FiArrowRight size={14} />
                </Link>
              </div>

              {!data ? (
                <SkeletonRows />
              ) : data.nextBookings.length === 0 ? (
                <Empty text="No upcoming appointments yet." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.nextBookings.map((booking) => (
                    <li key={booking.id} className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatShortDate(booking.date)}
                        <span className="font-normal text-slate-500">
                          {" "}
                          at {booking.time}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {booking.name}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {booking.services.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}