import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import PageHero from "../components/PageHero";
import heroImage from "../assets/images/styling1.jpg";
import { api, ApiError } from "../lib/api";

const details = [
  {
    icon: FiMapPin,
    title: "Visit us",
    lines: ["Ikeja, Lagos", "GRA, Lagos"],
  },
  {
    icon: FiClock,
    title: "Opening hours",
    lines: ["Open every day", "Barbershop: 24/7"],
  },
  {
    icon: FiPhone,
    title: "Call us",
    lines: ["+234 XXX XXX XXXX"],
  },
  {
    icon: FiMail,
    title: "Email us",
    lines: ["hello@facetalksalon.com"],
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // spam trap: real visitors leave it empty
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(false);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Please fill in your name, phone number and message.");
      return;
    }

    setError("");
    setSending(true);

    try {
      await api("/api/contact", {
        method: "POST",
        body: { name, phone, email, message, website },
      });

      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main>
      <PageHero image={heroImage} label="Contact" title="Get In Touch" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2">
        {/* Details */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pink-600">
            We'd love to hear from you
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
            Questions about a style or a service?
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            Send us a message and we'll get back to you. If you're ready to
            come in, you can{" "}
            <Link to="/booking" className="text-pink-600 underline underline-offset-4">
              book an appointment
            </Link>{" "}
            straight away.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="mt-1 shrink-0 text-pink-600" size={22} />
                <div>
                  <h3 className="font-semibold text-black">{item.title}</h3>
                  {item.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm leading-6 text-gray-600">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://www.instagram.com/facetalksalons"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-black hover:text-pink-600"
          >
            <FiInstagram size={20} />
            @facetalksalons
          </a>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-md bg-[#f8f5f2] p-6 sm:p-8"
        >
          <h2 className="text-2xl font-semibold text-black">Send a message</h2>

          <div>
            <label htmlFor="contact-name" className="text-sm font-medium text-black">
              Full name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className="text-sm font-medium text-black">
              Phone number
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="text-sm font-medium text-black">
              Email <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="text-sm font-medium text-black">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
            />
          </div>

          {/* Hidden trap for spam bots. People never see or fill this in. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {sent && (
            <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              Thank you. Your message has been received and we'll be in touch.
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-black px-7 py-3 text-white transition hover:bg-pink-600 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </main>
  );
}