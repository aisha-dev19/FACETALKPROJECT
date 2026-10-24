import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPhone, FiSearch } from "react-icons/fi";
import { api, ApiError } from "../lib/api";
import { formatDate } from "../lib/format";
import type { BookingRow } from "../lib/format";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";


type When = "upcoming" | "past" | "all";
type Status = "all" | "booked" | "cancelled";

type ListData = {
  bookings: BookingRow[];
  total: number;
  page: number;
  pages: number;
};

const tabs: { value: When; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

function messageFrom(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function StatusBadge({ status }: { status: BookingRow["status"] }) {
  if (status === "booked") {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Booked
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      Cancelled
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-4 p-5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex items-center gap-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="hidden h-10 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

export default function Bookings() {

      // Links from the Clients page open this page already filtered
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get("search") ?? "";
  const urlWhen = urlParams.get("when");
  const initialWhen: When =
    urlWhen === "all" || urlWhen === "past" ? urlWhen : "upcoming";
  // filters
  const [when, setWhen] = useState<When>(initialWhen);
  const [status, setStatus] = useState<Status>("all");
  const [date, setDate] = useState("");
  const [searchInput, setSearchInput] = useState(initialSearch); // what is typed
  const [search, setSearch] = useState(initialSearch); // what is sent to the server
  
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  // data
  const [data, setData] = useState<ListData | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );

  // cancelling
  const [target, setTarget] = useState<BookingRow | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [notice, setNotice] = useState("");

  const params = new URLSearchParams({ when, status, page: String(page) });
  if (date) params.set("date", date);
  if (search) params.set("search", search);
  const queryString = params.toString();

  // identifies this exact request; changes when a filter or "Try again" changes
  const key = `${queryString}#${attempt}`;
  const loading = loadedKey !== key && error?.key !== key;
  const shownError = error?.key === key ? error.message : "";

  // wait until the person stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // load the list
  useEffect(() => {
    let cancelled = false;

    api<ListData>(`/api/admin/bookings?${queryString}`)
      .then((result) => {
        if (cancelled) return;

        // e.g. the last booking on the last page was just cancelled
        if (result.page > result.pages) {
          setPage(result.pages);
          return;
        }

        setData(result);
        setLoadedKey(key);
      })
      .catch((err) => {
        if (!cancelled) setError({ key, message: messageFrom(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [queryString, key]);

  // hide the green message after a few seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function changeWhen(value: When) {
    setWhen(value);
    setPage(1);
  }

  function changeStatus(value: Status) {
    setStatus(value);
    setPage(1);
  }

  function changeDate(value: string) {
    setDate(value);
    setPage(1);
  }

  function clearFilters() {
    setWhen("upcoming");
    setStatus("all");
    setDate("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function confirmCancel() {
    if (!target) return;

    setCancelling(true);
    setCancelError("");

    try {
      await api(`/api/admin/bookings/${target.id}/cancel`, { method: "PATCH" });
      setNotice(
        `Cancelled ${target.name}'s booking on ${formatDate(target.date)} at ${target.time}.`,
      );
      setTarget(null);
    } catch (err) {
      setCancelError(messageFrom(err));
    } finally {
      setCancelling(false);
      setAttempt((n) => n + 1); // reload the list either way
    }
  }

  const rows = data?.bookings ?? [];
  const filtersActive =
    when !== "upcoming" || status !== "all" || date !== "" || search !== "";

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
        <p className="mt-1 text-slate-500">
          {data
            ? `${data.total} ${data.total === 1 ? "booking" : "bookings"}`
            : "Every appointment, in one place."}
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}

      {/* Filters */}
      <div className="mt-6 space-y-4">
        <div className="relative">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, service or username"
            aria-label="Search bookings"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex rounded-lg bg-slate-200/70 p-1 ${
              date ? "opacity-50" : ""
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                disabled={date !== ""}
                aria-pressed={when === tab.value}
                onClick={() => changeWhen(tab.value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  when === tab.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value as Status)}
            aria-label="Filter by status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="all">Any status</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => changeDate(e.target.value)}
            aria-label="Show one day only"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-900"
          />

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-pink-600 hover:text-pink-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {date && (
          <p className="text-sm text-slate-500">
            Showing every booking on {formatDate(date)}.
          </p>
        )}
      </div>

      {/* Results */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {shownError ? (
          <div className="p-6">
            <p className="font-medium text-red-800">
              We couldn't load the bookings.
            </p>
            <p className="mt-1 text-sm text-red-700">{shownError}</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : !data ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">No bookings found</p>
            <p className="mt-1 text-sm text-slate-500">
              {filtersActive
                ? "Try a different search or filter."
                : "New bookings will appear here."}
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            {/* Table: larger screens */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Services</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((booking) => (
                  <tr key={booking.id} className="align-top">
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {formatDate(booking.date)}
                      </p>
                      <p className="mt-0.5 text-slate-500">{booking.time}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {booking.name}
                      </p>
                      <p className="mt-0.5 text-slate-500">
                        @{booking.username}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <a
                        href={`tel:${booking.phone}`}
                        className="text-slate-700 hover:text-pink-600"
                      >
                        {booking.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {booking.services.join(", ")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {booking.status === "booked" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelError("");
                            setTarget(booking);
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards: phones */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((booking) => (
                <li key={booking.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatDate(booking.date)} at {booking.time}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {booking.name}{" "}
                        <span className="text-slate-400">
                          @{booking.username}
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {booking.services.join(", ")}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href={`tel:${booking.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-700"
                    >
                      <FiPhone size={14} />
                      {booking.phone}
                    </a>

                    {booking.status === "booked" && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelError("");
                          setTarget(booking);
                        }}
                        className="text-sm font-medium text-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pages */}
      {data && data.pages > 1 && !shownError && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} of {data.pages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {target && (
        <ConfirmDialog
          title="Cancel this booking?"
          message={`${target.name}'s appointment on ${formatDate(target.date)} at ${target.time} will be cancelled and the time becomes free for someone else. The client is not notified automatically, so you may want to call them.`}
          confirmLabel="Cancel booking"
          cancelLabel="Keep booking"
          busyLabel="Cancelling..."
          busy={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}