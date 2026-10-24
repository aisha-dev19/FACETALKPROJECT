import { testimonials } from "../data/testimonials";

type TestimonialsProps = {
  plain?: boolean; // white background, for pages where the section above is already beige
};

function Testimonials({ plain = false }: TestimonialsProps) {
  return (
    <section className={`${plain ? "bg-white" : "bg-[#f8f5f2]"} px-6 py-20`}>
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-600">
            Client Reviews
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
            What Our Clients Say
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            We are proud to create beautiful experiences for every client who
            walks through our doors.
          </p>
        </div>

        {/* Rating */}
        <div className="mt-10 flex flex-col items-center justify-center border-y border-gray-200 py-8">
          <div className="flex items-center gap-3">
            <span className="text-xl tracking-widest text-yellow-500">
              ★★★★★
            </span>

            <span className="font-semibold text-black">Highly Rated</span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Loved by clients for our service, quality, and attention to detail.
          </p>
        </div>

        {/* Reviews */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-md bg-white p-8 shadow-sm ring-1 ring-gray-100"
            >
              <p className="text-3xl text-pink-600">“</p>

              <p className="mt-3 leading-7 text-gray-600">{item.quote}</p>

              <div className="mt-6">
                <p className="font-semibold text-black">{item.name}</p>
                <p className="mt-1 text-sm text-gray-500">FACETALK Client</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;