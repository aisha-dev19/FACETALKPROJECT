import { useEffect, useState } from "react";
import { FiMail, FiMessageCircle, FiPhone, FiTrash2 } from "react-icons/fi";
import { api, ApiError } from "../lib/api";
import { formatSent, whatsappLink } from "../lib/format";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";

type MessageRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: number;
};

type Filter = "all" | "unread";

type ListData = {
  messages: MessageRow[];
  total: number;
  unread: number;
  page: number;
  pages: number;
};

function messageFrom(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function SkeletonRows() {
  return (
    <div className="space-y-6 p-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function Messages() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  const [data, setData] = useState<ListData | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );

  const [target, setTarget] = useState<MessageRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionError, setActionError] = useState("");

  const queryString = new URLSearchParams({
    filter,
    page: String(page),
  }).toString();

  // identifies this exact request; changes when a filter or a reload changes
  const key = `${queryString}#${attempt}`;
  const loading = loadedKey !== key && error?.key !== key;
  const shownError = error?.key === key ? error.message : "";

  useEffect(() => {
    let cancelled = false;

    api<ListData>(`/api/admin/messages?${queryString}`)
      .then((result) => {
        if (cancelled) return;

        // e.g. the last message on the last page was just deleted
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

  function changeFilter(value: Filter) {
    setFilter(value);
    setPage(1);
  }

  // tells the sidebar to refresh its unread number
  function tellSidebar() {
    window.dispatchEvent(new Event("messages-changed"));
  }

  async function setRead(message: MessageRow, read: boolean) {
    setActionError("");

    try {
      await api(`/api/admin/messages/${message.id}/read`, {
        method: "PATCH",
        body: { read },
      });
      setAttempt((n) => n + 1);
      tellSidebar();
    } catch (err) {
      setActionError(messageFrom(err));
    }
  }

  async function confirmDelete() {
    if (!target) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await api(`/api/admin/messages/${target.id}`, { method: "DELETE" });
      setTarget(null);
      tellSidebar();
    } catch (err) {
      setDeleteError(messageFrom(err));
    } finally {
      setDeleting(false);
      setAttempt((n) => n + 1);
    }
  }

  const rows = data?.messages ?? [];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
        <p className="mt-1 text-slate-500">
          What people send through the Contact page.
        </p>
      </div>

      <div className="mt-6 inline-flex rounded-lg bg-slate-200/70 p-1">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => changeFilter("all")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            filter === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All
        </button>
        <button
          type="button"
          aria-pressed={filter === "unread"}
          onClick={() => changeFilter("unread")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            filter === "unread"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Unread{data ? ` (${data.unread})` : ""}
        </button>
      </div>

      {actionError && (
        <p className="mt-4 text-sm text-red-600">{actionError}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {shownError ? (
          <div className="p-6">
            <p className="font-medium text-red-800">
              We couldn't load the messages.
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
            <p className="font-medium text-slate-900">
              {filter === "unread" ? "No unread messages" : "No messages yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {filter === "unread"
                ? "You're all caught up."
                : "Messages from the Contact page will appear here."}
            </p>
          </div>
        ) : (
          <ul
            className={`divide-y divide-slate-100 ${
              loading ? "opacity-60 transition-opacity" : ""
            }`}
          >
            {rows.map((message) => {
              const whatsapp = whatsappLink(message.phone);

              return (
                <li key={message.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                        message.read ? "bg-transparent" : "bg-pink-600"
                      }`}
                      title={message.read ? "Read" : "Unread"}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <p
                          className={`text-slate-900 ${
                            message.read ? "font-medium" : "font-semibold"
                          }`}
                        >
                          {message.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatSent(message.createdAt)}
                        </p>
                      </div>

                      <p className="mt-0.5 text-sm text-slate-500">
                        {message.phone}
                        {message.email && ` · ${message.email}`}
                      </p>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {message.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <a
                          href={`tel:${message.phone}`}
                          className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-pink-600"
                        >
                          <FiPhone size={14} />
                          Call
                        </a>

                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-pink-600"
                          >
                            <FiMessageCircle size={14} />
                            WhatsApp
                          </a>
                        )}

                        {message.email && (
                          <a
                            href={`mailto:${message.email}`}
                            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-pink-600"
                          >
                            <FiMail size={14} />
                            Email
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setRead(message, !message.read)}
                          className="font-medium text-pink-600 hover:text-pink-700"
                        >
                          {message.read ? "Mark as unread" : "Mark as read"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setTarget(message);
                          }}
                          className="ml-auto inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
          title="Delete this message?"
          message={`The message from ${target.name} will be deleted for good. This can't be undone.`}
          confirmLabel="Delete message"
          cancelLabel="Keep message"
          busyLabel="Deleting..."
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}