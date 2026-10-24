import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import styling1 from "../assets/images/styling1.jpg";

const Consultation = () => {
  return (
    <section
      className="relative min-h-[620px]"
      style={{ clipPath: "inset(0)" }}
    >
      {/* Picture pinned to the screen; the section clips it to its own box */}
      <img
        src={styling1}
        alt=""
        className="fixed inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/55"></div>

      <div className="relative z-10 flex min-h-[620px] items-center justify-center px-6 text-center text-white">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-normal leading-tight sm:text-6xl">
            We Offer Consultations,
            <br />
            Virtually & In-Salon
          </h2>

          <p className="mt-8 text-base leading-8 text-white/80 sm:text-xl">
            Hair woes? Not sure what to do with your hair? We offer 45-minute
            consultations (virtually and face-to-face) with our head stylist so
            feel free to book your consultation with us today.
          </p>

          <Link
            to="/booking"
            state={{ service: "Consultation" }}
            className="mt-8 inline-flex items-center gap-3 text-lg font-medium transition hover:text-pink-400"
          >
            Book Now
            <FiArrowRight aria-hidden="true" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Consultation;