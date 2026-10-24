import { Link } from "react-router-dom";
import { FiArrowDownRight } from "react-icons/fi";

import styling1 from "../assets/images/styling1.jpg";
import styling2 from "../assets/images/styling2.jpg";
import styling3 from "../assets/images/styling3.jpg";
import styling4 from "../assets/images/styling4.jpg";

const services = [
  {
    title: "Styling",
    image: styling1,
    text: "Beautiful hairstyles created to complement your personality and give you a confident, polished look.",
  },
  {
    title: "Colour",
    image: styling2,
    text: "Transform your look with beautiful colour designed to enhance your style and personality.",
  },
  {
    title: "Extensions",
    image: styling3,
    text: "Elevate your style with quality extensions that add length, volume, and a beautiful natural finish.",
  },
  {
    title: "Afro Hair",
    image: styling4,
    text: "Celebrate your natural texture with expert care and styling that brings out the beauty of your hair.",
  },
];

function ServicesSection() {
  return (
    <section id="services" className="px-6 py-20">
      <div className="mx-auto">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-600">
            Our Services
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
            Beauty made just for you.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Discover beauty made just for you. From flawless hair and makeup to
            stunning nails, pedicures, and expert barbering, FACETALK brings
            professional beauty care, creativity, and confidence together under
            one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative h-[520px] overflow-hidden rounded-md"
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <h3 className="text-2xl font-semibold">{service.title}</h3>

                {/* Visible by default; hidden until hover only on large screens */}
                <div className="mt-3 max-h-32 overflow-hidden opacity-100 transition-all duration-500 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-32 lg:group-hover:opacity-100">
                  <p className="text-sm leading-6">{service.text}</p>

                  <Link
                    to="/booking"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    Book this
                    <FiArrowDownRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;