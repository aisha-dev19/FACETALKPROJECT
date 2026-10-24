import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

function AboutSection() {
  return (
    <section id="about" className="mx-auto rounded-xl px-6 py-20 bg-slate-100  min-h-[620px]">
      <h2 className="text-5xl font-normal leading-tight text-black">
        Welcome to Facetalk Salon
      </h2>

      <p className="mt-6 text-xl leading-[1.7] text-neutral-600 sm:text-2xl">
        Facetalk Salon and Makeup is a unisex hair and beauty destination in
        Ikeja, Lagos, Nigeria. We offer sew-ins, wigs, hair styling, makeup,
        nails, pedicure, and barbering, with branches across Ikeja and GRA so
        you're never far from a great look. Our doors are open every day, and
        our barbershop runs 24/7. We make it our priority that every client
        receives personalised service and beautiful, natural-looking results.
        Our philosophy is simple: you come first, and we're proud to bring that
        experience to you in our salon.
      </p>

      <p className="mt-6 text-xl leading-relaxed text-neutral-600 sm:text-2xl">
        We hope to see you soon!
      </p>

      <Link
        to="/booking"
        className="mt-8 inline-flex items-center gap-3 text-xl font-medium text-black transition hover:text-pink-600 sm:text-2xl"
      >
        Book Now
        <FiArrowRight size={20} />
      </Link>
    </section>
  );
}

export default AboutSection;
