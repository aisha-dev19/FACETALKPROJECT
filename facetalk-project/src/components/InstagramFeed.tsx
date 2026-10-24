import salonVideo from "../assets/videos/facetalksalon.mov";
import { FiInstagram, FiPlay } from "react-icons/fi";

function InstagramFeed() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto  min-h-[620px]">
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((video) => (
            <a
              key={video}
              href="https://www.instagram.com/facetalksalons?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[9/16] overflow-hidden rounded-md"
            >
              <video
                src={salonVideo}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
                  <FiPlay size={20} />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="https://www.instagram.com/facetalksalons?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-base font-medium text-white shadow-md transition hover:bg-pink-600"
          >
            <FiInstagram size={24} />
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

export default InstagramFeed;
