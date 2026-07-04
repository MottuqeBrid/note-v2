import { Link } from "react-router";

const Logo = ({ cls = "" }) => {
  return (
    <Link
      to="/"
      aria-label="M-Note home"
      className={`group inline-flex items-center gap-2 rounded-lg py-1 transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${cls}`}
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-base-100 transition duration-300 group-hover:scale-125" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 4.75h7.25L18 8.5v10.75H7A2 2 0 0 1 5 17.25V6.75a2 2 0 0 1 2-2Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5v4h4M8.5 12h7M8.5 15h5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m13.75 18.25 4.5-4.5 1.5 1.5-4.5 4.5H13.5l.25-1.5Z"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-black text-base-content">
          M<span className="text-primary">Note</span>
        </span>
        <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/45 sm:block">
          Smart Notes
        </span>
      </span>
    </Link>
  );
};

export default Logo;
