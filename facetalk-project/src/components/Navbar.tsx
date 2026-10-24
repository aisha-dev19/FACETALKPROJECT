import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiUser, FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
];

// NavLink tells us whether it points to the current page
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium hover:text-pink-600 ${isActive ? "text-pink-600" : ""}`;

function Navbar({ fixed = false }: { fixed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`${
        fixed ? "fixed inset-x-0 top-0 z-50 bg-white shadow-sm" : "relative z-50 w-full"
      } px-6 py-5`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-2xl font-bold md:text-3xl">
          FACETALK
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-sm md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            className="hidden items-center justify-center md:flex"
          >
            <FiSearch size={22} />
          </button>

          <div className="group relative hidden md:block">
            <button
              aria-label="Account"
              className="flex items-center justify-center"
            >
              <FiUser size={22} />
            </button>
            <div className="absolute right-0 top-full z-50 hidden w-44 rounded-md bg-white py-2 shadow-lg group-hover:block group-focus-within:block">
              {user ? (
                <>
                  <p className="truncate px-4 py-2 text-sm font-semibold">
                    Hi, {user.username}
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <Link
            to="/booking"
            className="rounded-full bg-pink-600 px-4 py-2 text-xs font-medium text-white hover:bg-pink-700 md:px-5 md:py-2.5 md:text-sm"
          >
            Book Now
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="md:hidden"
          >
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute left-0 top-full flex w-full flex-col gap-4 bg-white p-6 shadow-md md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={closeMenu}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}

            <hr className="border-gray-200" />

            {user ? (
              <>
                <p className="font-semibold">Hi, {user.username}</p>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="w-fit text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/signup" onClick={closeMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;