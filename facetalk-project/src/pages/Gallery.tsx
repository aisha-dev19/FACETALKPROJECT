import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import PageHero from "../components/PageHero";
import heroImage from "../assets/images/styling1.jpg";

// Vite finds every image in the gallery folder at build time
const modules = import.meta.glob("../assets/gallery/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const photos = Object.values(modules);

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);

  // Keyboard: Esc closes, arrows move between photos
  useEffect(() => {
    if (selected === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight")
        setSelected((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setSelected((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  function showNext() {
    setSelected((i) => (i === null ? i : (i + 1) % photos.length));
  }

  function showPrevious() {
    setSelected((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  }

  return (
    <main>
      <PageHero image={heroImage} label="Gallery" title="Our Work" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        {photos.length === 0 ? (
          <p className="text-center text-gray-600">Photos coming soon.</p>
        ) : (
          <div className="columns-2 gap-3 md:columns-3">
            {photos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Open photo ${index + 1}`}
                className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-md"
              >
                <img
                  src={photo}
                  alt={`FACETALK salon work, photo ${index + 1}`}
                  loading="lazy"
                  className="w-full transition-transform duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen viewer */}
      {selected !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute right-5 top-5 text-white"
          >
            <FiX size={32} />
          </button>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              showPrevious();
            }}
            className="absolute left-3 text-white sm:left-6"
          >
            <FiChevronLeft size={40} />
          </button>

          <img
            src={photos[selected]}
            alt={`FACETALK salon work, photo ${selected + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-md object-contain"
          />

          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-3 text-white sm:right-6"
          >
            <FiChevronRight size={40} />
          </button>
        </div>
      )}
    </main>
  );
}