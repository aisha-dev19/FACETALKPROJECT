import { Link } from "react-router-dom";
import styling1 from "../assets/images/styling1.jpg";
import Testimonials from "../components/Testimonials";

const features = [
  {
    title: "Unisex Beauty",
    text: "Professional beauty and grooming services designed for both men and women.",
  },
  {
    title: "Personalised Care",
    text: "We take the time to understand your needs and create a look that feels right for you.",
  },
  {
    title: "Versatile Services",
    text: "From hair and makeup to nails, pedicures, and barbering, we bring different beauty needs together under one roof.",
  },
  {
    title: "Quality Results",
    text: "Our focus is on delivering beautiful results while making every client feel confident and satisfied.",
  },
];

const testimonials = [
  {
    name: "Vinita B",
    rating: 5,
    quote:
      "I'm just 4 months in Lagos and was on a hunt for a salon which would fulfill my special requirement of hair extensions, a place which was well",
  },
  {
    name: "Sarah A",
    rating: 5,
    quote:
      "The team is warm, professional, and incredibly detail-focused. I left feeling confident and beautiful.",
  },
  {
    name: "Tolu O",
    rating: 5,
    quote:
      "From styling to aftercare, I felt truly cared for. FACETALK gives a premium salon experience every time.",
  },
];

function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src={styling1}
          alt="Facetalk Salon"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em]">About Us</p>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl">
              Welcome to FACETALK
            </h1>
          </div>
        </div>
      </section>

      {/* Our story: text on the left, image on the right */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-600">
              Our Story
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Beauty, confidence and personalised care.
            </h2>
            <p className="mt-6 leading-8 text-gray-600">
              Facetalk Salon and Makeup is a unisex hair and beauty destination
              in Ikeja, Lagos, Nigeria. We offer sew-ins, wigs, hair styling,
              makeup, nails, pedicure, and barbering.
            </p>
            <p className="mt-5 leading-8 text-gray-600">
              Our doors are open every day, and our barbershop runs 24/7. Every
              client receives personalised service and beautiful,
              natural-looking results.
            </p>
            <Link
              to="/booking"
              className="mt-8 inline-block bg-black px-7 py-3 text-white hover:bg-pink-600"
            >
              Book Now
            </Link>
          </div>

          <img
            src={styling1}
            alt="Salon"
            className="h-[500px] w-full rounded-md object-cover"
          />
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-[#f8f5f2] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-600">
              Why Choose FACETALK
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-black sm:text-5xl">
              Beauty care with you at the centre.
            </h2>
            <p className="mt-6 text-base leading-8 text-gray-600">
              At FACETALK, we believe beauty is personal. Every client has their
              own style, personality, and vision, which is why we focus on
              creating an experience that is tailored to you.
            </p>
            <p className="mt-5 text-base leading-8 text-gray-600">
              Our team is dedicated to delivering beautiful results across a
              wide range of hair and beauty services. From everyday styling and
              transformations to makeup, nails, pedicures, and professional
              barbering, our goal is to help you leave the salon feeling
              confident and looking your best.
            </p>
          </div>

          <div className="space-y-6 text-base leading-8 text-gray-600">
            <p>
              We pride ourselves on versatility and our ability to cater to both
              women and men. Whether you already know exactly what you want or
              need guidance finding the right look, our team is here to help
              bring your vision to life.
            </p>
            <p>
              Our philosophy is simple: quality service, beautiful results, and
              genuine attention to every client. We want FACETALK to be more than
              just a place to get your hair or beauty treatment done. We want it
              to be a place where you feel comfortable, cared for, and
              confident.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((item) => (
                <div key={item.title} className="border-t border-black/20 pt-6">
                  <h3 className="text-xl font-semibold text-black">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold text-black sm:text-5xl">
            Real feedback from our clients
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-medium text-black">
                    {item.name}
                  </h3>
                  <div className="mt-3 flex justify-center gap-1 text-xl">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <span
                        key={`${item.name}-star-${index}`}
                        className="text-yellow-500"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    {item.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Testimonials />
    </main>
  );
}

export default About;