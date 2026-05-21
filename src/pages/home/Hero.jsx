import { useEffect, useState } from "react";
import heroImg from "../../assets/hero.png";

const slides = [
  {
    id: 1,
    title: "Capture Every Idea",
    subtitle:
      "Create, organize, and access your notes from anywhere. Start writing today.",
    cta: "Get Started",
    link: "/register",
    gradient: "from-primary/20 to-secondary/20",
    img: heroImg,
  },
  {
    id: 2,
    title: "Stay Organized",
    subtitle:
      "Tag, categorize, and search your notes instantly. Never lose a thought again.",
    cta: "Explore",
    link: "/notes",
    gradient: "from-accent/20 to-secondary/20",
    img: null,
  },
  {
    id: 3,
    title: "Your Privacy Matters",
    subtitle:
      "End-to-end encrypted notes with full control over your data. Secure by design.",
    cta: "Learn More",
    link: "/register",
    gradient: "from-neutral/20 to-primary/20",
    img: null,
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => setCurrent(index);

  return (
    <div className="relative w-full overflow-hidden rounded-box">
      <div className="carousel w-full" style={{ scrollBehavior: "smooth" }}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            id={`slide-${slide.id}`}
            className={`carousel-item relative w-full transition-opacity duration-700 ${
              i === current ? "opacity-100" : "hidden"
            }`}
          >
            <div
              className={`hero min-h-[70vh] bg-linear-to-br ${slide.gradient}`}
            >
              <div className="hero-content text-center">
                {slide.img && (
                  <div className="hidden lg:block mr-12">
                    <img
                      src={slide.img}
                      alt="Hero"
                      className="max-w-sm rounded-lg shadow-2xl"
                    />
                  </div>
                )}
                <div className="max-w-lg">
                  <h1 className="text-4xl md:text-5xl font-bold text-base-content">
                    {slide.title}
                  </h1>
                  <p className="py-6 text-base-content/70 text-lg">
                    {slide.subtitle}
                  </p>
                  <a href={slide.link} className="btn btn-primary btn-lg">
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-primary w-8"
                : "bg-base-content/30 hover:bg-base-content/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
