import { Link } from "react-router-dom";
import { categories } from "../data/services";
import PageHero from "../components/PageHero";
import styling1 from "../assets/images/styling1.jpg";

export default function ServicesPage() {
  return (
    <main>
      <PageHero image={styling1} label="Our Services" title="Everything We Do" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="mb-12 max-w-2xl leading-7 text-gray-600">
          Browse our services, then tap "Book this" to pick a date and time.
        </p>

        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.title}>
              <h2 className="border-b border-black/20 pb-3 text-2xl font-semibold text-black">
                {category.title}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <div
                    key={service.name}
                    className="flex flex-col justify-between rounded-md border border-gray-200 bg-white p-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {service.text}
                      </p>
                    </div>

                    <Link
                      to="/booking"
                      state={{ service: service.name }}
                      className="mt-6 inline-block w-fit bg-black px-5 py-2 text-sm text-white transition hover:bg-pink-600"
                    >
                      Book this
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}