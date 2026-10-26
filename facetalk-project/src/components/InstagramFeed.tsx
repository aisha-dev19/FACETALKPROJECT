import facetalkSalon from "../assets/videos/facetalksalon.mp4";
import imagenails from "../assets/videos/imagenails.mp4";
import salon from "../assets/videos/salon.mp4";
import { useEffect, useState } from "react";
import { FiInstagram, FiPlay } from "react-icons/fi";

const videos = [facetalkSalon, imagenails, salon, facetalkSalon, imagenails];

function InstagramVideoCard({ videoSrc }: { videoSrc: string }) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [minimumLoadingTimePassed, setMinimumLoadingTimePassed] =
    useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMinimumLoadingTimePassed(true);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, []);

  const isLoaded = isVideoReady && minimumLoadingTimePassed;

  return (
    <a
      href="https://www.instagram.com/facetalksalons?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-[9/16] overflow-hidden rounded-md bg-slate-200"
    >
      <video
        src={videoSrc}
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsVideoReady(true)}
      />

      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"
        />
      )}

      {isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
            <FiPlay size={20} />
          </div>
        </div>
      )}
    </a>
  );
}

function InstagramFeed() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto  min-h-[620px]">
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {videos.map((videoSrc, index) => (
            <InstagramVideoCard
              key={`${videoSrc}-${index}`}
              videoSrc={videoSrc}
            />
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
