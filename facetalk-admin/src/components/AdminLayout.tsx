import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FiCalendar,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/auth";
import { api } from "../lib/api";

const links = [
  { to: "/", label: "Dashboard", icon: FiGrid },
  { to: "/bookings", label: "Bookings", icon: FiCalendar },
  { to: "/clients", label: "Clients", icon: FiUsers },
  { to: "/messages", label: "Messages", icon: FiMessageSquare },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  // every page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // the unread number on the Messages link: refreshed when you change page,
  // and whenever the Messages page reads or deletes something
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    function refresh() {
      api<{ count: number }>("/api/admin/messages/unread-count")
        .then((data) => {
          if (!cancelled) setUnread(data.count);
        })
        .catch(() => {
          // the badge is a nicety; a failure here should stay quiet
        });
    }

    refresh();
    window.addEventListener("messages-changed", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("messages-changed", refresh);
    };
  }, [user, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading...
      </div>
    );
  }

  // Not logged in as an admin: send to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark overlay behind the menu on phones */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="text-xl font-bold tracking-wide text-white">
              FACETALK
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.25em] text-pink-400">
              Admin
            </p>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-pink-500 bg-white/10 text-white"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <link.icon size={18} />
              {link.label}

              {link.to === "/messages" && unread > 0 && (
                <span className="ml-auto rounded-full bg-pink-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-600 text-sm font-semibold uppercase text-white">
              {user.username.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user.username}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <FiLogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="lg:pl-64">
        {/* Top bar, phones only */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="relative text-slate-700"
          >
            <FiMenu size={24} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-pink-600" />
            )}
          </button>
          <p className="font-bold tracking-wide text-slate-900">
            FACETALK <span className="text-pink-600">Admin</span>
          </p>
          <span className="w-6" />
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div key={pathname} className="page-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}