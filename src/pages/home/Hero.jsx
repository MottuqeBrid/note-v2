import { Link } from "react-router";
import {
  FiArrowRight,
  FiLogIn,
  FiFileText,
  FiCode,
  FiLock,
} from "react-icons/fi";
import image from "./hero1.png";
import { useAuth } from "./../../hooks/useAuth";
import Logo from "../../components/Logo/Logo";

const BADGES = [
  { icon: FiFileText, label: "Rich Notes" },
  { icon: FiCode, label: "40+ Languages" },
  { icon: FiLock, label: "Private & Secure" },
];

const Hero = () => {
  const { user, loading } = useAuth();

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-base-100/50">
      {/* Background */}
      <img
        src={image}
        alt="M-Note workspace preview"
        className="absolute inset-0 -z-10 h-full w-full object-center opacity-20"
      />
      {/* <div className="absolute inset-0 -z-10 bg-linear-to-tl from-neutral/70 via-neutral/50 to-neutral/20" /> */}

      {/* Glow */}
      {/* <div className="absolute -top-32 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" /> */}

      <div className="min-h-[76vh] px-5 py-24 sm:px-8 lg:px-16">
        <div className="flex min-h-[58vh] max-w-3xl flex-col justify-center">
          {/* Label */}
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {/* <span className="text-xs font-bold uppercase tracking-widest text-primary">
              M-Note
            </span> */}
            <Logo />
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-base-content sm:text-5xl lg:text-6xl">
            Capture notes, files, <span className="text-primary">and code</span>{" "}
            in one private workspace.
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/60 sm:text-lg">
            Write rich notes, attach files, save snippets in 40+ languages, and
            keep your knowledge organized wherever you work.
          </p>

          {/* Feature badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-base-content/10 bg-base-content/5 px-3 py-1 text-xs font-medium text-base-content/70"
              >
                <Icon className="text-primary" />
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to={user && !loading ? "/notes" : "/register"}
              className="btn btn-primary gap-2 px-6"
            >
              Get Started
              <FiArrowRight />
            </Link>

            {!user && !loading && (
              <Link
                to="/login"
                className="btn gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:border-primary hover:bg-primary hover:text-primary-content"
              >
                <FiLogIn />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
