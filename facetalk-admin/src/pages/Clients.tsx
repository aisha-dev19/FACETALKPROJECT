import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { api, ApiError } from "../lib/api";
import { formatJoined } from "../lib/format";
import Skeleton from "../components/Skeleton";

type Client = {
  id: string;
  username: string;
  email: string;
  joined: number;
  bookings: number; // active (not cancelled)
};

// Opens the Bookings page showing everything for this client
function bookingsLink(client: Client) {
  return `/bookings?when=all&search=${encodeURIComponent(client.username)}`;
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-semibold uppercase text-pink-700">
      {name.charAt(0)}
    </span>
  );
}

function BookingsCount({ count }: { count: number }) {
  return count > 0 ? (
    <span className="inline-flex rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
      {count} active
    </span>
  ) : (
    <span className="text-sm text-slate-400">None</span>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-4 p-5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="hidden h-10 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    api<{ clients: Client[] }>("/api/admin/clients")
      .then((result) => {
        if (cancelled) return;
        setClients(result.clients);
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

  const query = search.trim().toLowerCase();
  const shown = (clients ?? []).filter(
    (c) =>
      c.username.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query),
  );

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <p className="mt-1 text-slate-500">
          {clients
            ? `${clients.length} ${clients.length === 1 ? "client" : "clients"}`
            : "Everyone with an account on the website."}
        </p>
      </div>

      <div className="relative mt-6">
        <FiSearch
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email"
          aria-label="Search clients"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="p-6">
            <p className="font-medium text-red-800">
              We couldn't load the clients.
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
        ) : !clients ? (
          <SkeletonRows />
        ) : shown.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              {clients.length === 0 ? "No clients yet" : "No clients found"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {clients.length === 0
                ? "When people sign up on the website, they appear here."
                : "Try a different search."}
            </p>
          </div>
        ) : (
          <>
            {/* Table: larger screens */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((client) => (
                  <tr key={client.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.username} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {client.username}
                          </p>
                          <p className="truncate text-slate-500">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatJoined(client.joined)}
                    </td>
                    <td className="px-5 py-4">
                      <BookingsCount count={client.bookings} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={bookingsLink(client)}
                        className="text-sm font-medium text-pink-600 hover:text-pink-700"
                      >
                        View bookings
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards: phones */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {shown.map((client) => (
                <li key={client.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={client.username} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">
                        {client.username}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {client.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Joined {formatJoined(client.joined)}
                      </p>
                    </div>
                    <BookingsCount count={client.bookings} />
                  </div>

                  <Link
                    to={bookingsLink(client)}
                    className="mt-3 inline-block text-sm font-medium text-pink-600"
                  >
                    View bookings
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}