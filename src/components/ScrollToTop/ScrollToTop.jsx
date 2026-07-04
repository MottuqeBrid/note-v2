import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { FiArrowUp } from "react-icons/fi";

const SHOW_AFTER = 320;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setVisible(scrollTop > SHOW_AFTER);
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-primary-content shadow-xl shadow-primary/25 transition duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 md:bottom-8 md:right-8 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-90 opacity-0"
      }`}
      style={{
        background: `conic-gradient(var(--color-primary) ${progress}%, color-mix(in srgb, var(--color-primary) 20%, var(--color-base-100)) 0)`,
      }}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary transition duration-300 hover:bg-secondary">
        <FiArrowUp className="h-5 w-5" />
      </span>
    </button>
  );
};

export default ScrollToTop;
