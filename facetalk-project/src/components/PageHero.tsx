type PageHeroProps = {
  image: string;
  label: string;
  title: string;
};

export default function PageHero({ image, label, title }: PageHeroProps) {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <img src={image} alt="" className="h-full w-full object-cover" />

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.3em]">{label}</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{title}</h1>
        </div>
      </div>
    </section>
  );
}