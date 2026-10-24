import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { categories } from "../data/services";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
  { to: "/booking", label: "Book Now" },
];

function Footer() {
  return (
    <footer className="bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold tracking-wide">FACETALK</h2>

          <p className="mt-5 text-sm leading-7 text-white/70">
            Your beauty, your story. Experience professional hair and beauty
            care designed to help you look and feel your best.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-4">
          <div>
            <h3 className="font-semibold">Quick Links</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Services</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              {categories.map((category) => (
                <Link
                  key={category.title}
                  to="/services"
                  className="transition hover:text-white"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Visit Us</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm leading-6 text-white/70">
              <p>Ikeja, Lagos</p>
              <p>GRA, Lagos</p>
              <p>Open Every Day</p>
              <p>Barbershop: 24/7</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Contact</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm leading-6 text-white/70">
              <p>Phone: +234 XXX XXX XXXX</p>
              <p>Email: hello@facetalksalon.com</p>

              <div className="mt-4 flex gap-4">
                <a
                  href="https://www.instagram.com/facetalksalons"
                  className="transition hover:text-pink-400"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiInstagram size={22} />
                </a>

                <a
                  href="#"
                  className="transition hover:text-pink-400"
                  aria-label="Facebook"
                >
                  <FiFacebook size={22} />
                </a>

                <a
                  href="#"
                  className="transition hover:text-pink-400"
                  aria-label="Twitter"
                >
                  <FiTwitter size={22} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/20 pt-6 text-sm text-white/50">
          <p>© {new Date().getFullYear()} FACETALK Salon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;