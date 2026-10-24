import salonVideo from "../assets/videos/salon.mov";
import imagenails from "../assets/videos/imagenails.mov";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

function Home() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-[1500px] overflow-hidden rounded-xl bg-neutral-950 text-white lg:min-h-[760px] lg:grid-cols-2">
        {/* Text side with video background */}
        <div className="relative isolate flex min-h-[32rem] flex-col justify-center overflow-hidden px-7 py-16 sm:px-12 lg:px-14">
          <video
            className="absolute inset-0 z-0 h-full w-full scale-[1.45] object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          >
            <source src={imagenails} />
          </video>

          {/* Dark overlay so the text stays readable */}
          <div className="absolute inset-0 z-10 bg-black/50" />

          <div className="relative z-20">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              FACETALK SALON
            </p>
            <h1 className="text-4xl font-medium leading-tight sm:text-5xl lg:text-5xl xl:text-6xl">
              Effortless Sew-Ins, 
              <br />
              Wherever Life Takes You
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              Step into hair that looks polished, natural, and completely effortless.
               From flawless sew-ins to expert styling and care, every service is tailored to your look, 
               your routine, and the way you live, so you can walk out feeling confident and beautiful.
            </p>
            <Link
              to="/services"
              className="mt-8 inline-flex items-center gap-3 text-lg font-medium text-white hover:text-white/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore Services
              <FiArrowRight aria-hidden="true" size={20} />
            </Link>
          </div>
        </div>

        {/* Video side */}
        <div className="relative h-[28rem] overflow-hidden sm:h-[36rem] lg:h-auto">
          <video
            className="absolute inset-0 h-full w-full scale-[1.14] object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          >
            <source src={salonVideo} />
          </video>
        </div>
      </section>
    </main>
  );
}

export default Home;