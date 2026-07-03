import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiHeart,
  FiFileText,
  FiFolder,
  FiShield,
  FiInfo,
} from "react-icons/fi";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";

const Footer = () => {
  const [footerAccountLinks, setFooterAccountLinks] = useState([]);
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();

  const updatedFooterLinks = () => {
    if (user && !loading && user?.role == "admin") {
      setFooterAccountLinks([
        { label: "Profile", to: "/profile" },
        { label: "Settings", to: "/settings" },
        { label: "Admin", to: "/admin" },
      ]);
    } else if (!user && !loading) {
      setFooterAccountLinks([
        { label: "Login", to: "/login" },
        { label: "Sign Up", to: "/signup" },
      ]);
    } else if (user && !loading && user?.role !== "admin") {
      setFooterAccountLinks([
        { label: "Profile", to: "/profile" },
        { label: "Settings", to: "/settings" },
      ]);
    }
  };
  useEffect(() => {
    return () => updatedFooterLinks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div
          className={`grid grid-cols-1 md:grid-cols-${user && !loading ? "4" : "2"} gap-8`}
        >
          {/* ─── Brand ─── */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FiFileText className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-primary">M-NOTE</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              A simple and powerful note-taking app to organize your thoughts,
              code, and files in one place.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-ghost btn-sm text-gray-500 hover:text-primary"
              >
                <FiGithub className="text-lg" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-ghost btn-sm text-gray-500 hover:text-primary"
              >
                <FiTwitter className="text-lg" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-ghost btn-sm text-gray-500 hover:text-primary"
              >
                <FiLinkedin className="text-lg" />
              </a>
              <a
                href="mailto:contact@mnote.com"
                className="btn btn-circle btn-ghost btn-sm text-gray-500 hover:text-primary"
              >
                <FiMail className="text-lg" />
              </a>
            </div>
          </div>

          {/* ─── Features ─── */}
          {user && !loading && (
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-gray-600">
                Features
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  { icon: <FiFileText />, label: "Notes", to: "/notes" },
                  { icon: <FiFolder />, label: "Folders", to: "/folders" },
                  { icon: <FiShield />, label: "Secure Storage", to: "/notes" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      <span className="text-primary">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── Account ─── */}
          {user && !loading && (
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-gray-600">
                Account
              </h3>
              <ul className="flex flex-col gap-2">
                {footerAccountLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── Legal ─── */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-gray-600">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Cookie Policy", to: "/cookies" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* About */}
            <div className="mt-4">
              <Link
                to="/about"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <FiInfo /> About Us
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="divider my-6" />

        {/* ─── Bottom Bar ─── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            © {currentYear}{" "}
            <span className="text-primary font-semibold">M-NOTE</span>. All
            rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <FiHeart className="text-red-400" /> by{" "}
            <a
              href="https://brid.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Mottuqe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
