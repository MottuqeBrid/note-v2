import {
  FiArrowRight,
  FiFileText,
  FiFolder,
  FiGithub,
  FiHeart,
  FiInfo,
  FiLinkedin,
  FiLock,
  FiMail,
  FiSettings,
  FiTwitter,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router";
import { useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../Logo/Logo";
import { MdPublic } from "react-icons/md";

const socialLinks = [
  { label: "GitHub", href: "https://github.com", Icon: FiGithub },
  { label: "Twitter", href: "https://twitter.com", Icon: FiTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FiLinkedin },
  { label: "Email", href: "mailto:contact@mnote.com", Icon: FiMail },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Cookie Policy", to: "/cookies" },
  { label: "About Us", to: "/about", Icon: FiInfo },
];

const featureLinks = [
  { icon: FiFileText, label: "Notes", to: "/notes" },
  { icon: FiFolder, label: "Files", to: "/my-files" },
  { icon: MdPublic, label: "Shared Files", to: "/shared-files" },
];

const getAccountLinks = (user) => {
  if (!user) {
    return [
      { icon: FiUser, label: "Login", to: "/login" },
      { icon: FiArrowRight, label: "Register", to: "/register" },
    ];
  }

  const links = [
    { icon: FiUser, label: "Profile", to: "/profile" },
    { icon: FiSettings, label: "Settings", to: "/settings" },
  ];

  if (user.role === "admin") {
    links.push({ icon: FiLock, label: "Admin", to: "/admin" });
  }

  return links;
};

function FooterSkeleton() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <div className="skeleton h-10 w-44 rounded-lg" />
            <div className="skeleton h-4 w-full max-w-md" />
            <div className="skeleton h-4 w-3/4 max-w-sm" />
            <div className="flex gap-3">
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-36" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-36" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ item, index }) {
  const Icon = item.icon || item.Icon;

  return (
    <li
      className="animate-[footer-rise_0.55s_ease-out_both]"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <Link
        to={item.to}
        className="group flex w-fit items-center gap-2 rounded-md py-1 text-sm text-base-content/60 transition duration-200 hover:translate-x-1 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {Icon && (
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary transition duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-base-content/50">
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {links.map((item, index) => (
          <FooterLink key={item.label} item={item} index={index} />
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();
  const accountLinks = useMemo(() => getAccountLinks(user), [user]);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) return <FooterSkeleton />;

  return (
    <footer className="mt-auto overflow-hidden border-t border-base-300 bg-base-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div className="animate-[footer-rise_0.6s_ease-out_both]">
            <div className="rounded-lg border border-base-300 bg-base-200/45 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
              <Logo />
              <p className="mt-4 max-w-md text-sm leading-6 text-base-content/60">
                A focused workspace for notes, code snippets, and file folders.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {socialLinks.map(({ label, href, Icon }, index) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={
                      href.startsWith("mailto:")
                        ? undefined
                        : "noopener noreferrer"
                    }
                    aria-label={label}
                    className="group grid h-10 w-10 place-items-center rounded-full border border-base-300 bg-base-100 text-base-content/60 transition duration-300 hover:-translate-y-1 hover:rotate-3 hover:border-primary hover:bg-primary hover:text-primary-content focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <Icon className="h-4 w-4 transition duration-300 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <FooterColumn title="Features" links={featureLinks} />
          <FooterColumn title="Account" links={accountLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="my-8 h-px bg-base-300" />

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/profile"
                className="group flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/60 px-3 py-2 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/25 animate-[footer-ping_1.8s_ease-out_infinite]" />
                  <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-content">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      initials || <FiUser className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user.name || "Your account"}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {user.role === "admin" ? "Admin workspace" : "Workspace"}
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-content"
              >
                Get started
                <FiArrowRight className="transition duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm text-base-content/55 md:items-end">
            <p>
              &copy; {currentYear}{" "}
              <span className="font-semibold text-primary">M-Note</span>. All
              rights reserved.
            </p>
            <p className="flex items-center gap-1">
              Made with{" "}
              <FiHeart className="animate-[footer-heart_1.5s_ease-in-out_infinite] text-red-400" />{" "}
              by{" "}
              <a
                href="https://brid.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary transition hover:underline"
              >
                Mottuqe
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
