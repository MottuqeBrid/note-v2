import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import {
  FiBell,
  FiFileText,
  FiMenu,
  FiMoon,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "active border-primary bg-primary/10 text-primary"
        : "border-transparent text-neutral hover:bg-primary/10 hover:text-primary"
    }`;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-3 z-50 rounded-md bg-primary p-3 text-white shadow-lg"
          aria-label="Open sidebar"
        >
          <FiMenu size={20} />
        </button>
      )}

      {isOpen && (
        <aside
          ref={sidebarRef}
          className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-primary/20 bg-base-100 px-4 py-5 text-neutral shadow-xl transition"
        >
          <div className="mb-8 flex items-center justify-between">
            <NavLink
              to="/admin"
              className="flex items-center gap-2 text-lg font-semibold text-neutral"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <FiZap />
              </span>
              Notes Admin
            </NavLink>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 text-neutral hover:bg-primary/10 hover:text-primary"
              aria-label="Close sidebar"
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            <NavLink to="/admin/notes" className={navClass}>
              <FiFileText />
              All Notes
            </NavLink>

            <NavLink to="/admin/users" className={navClass}>
              <FiUsers />
              All Users
            </NavLink>

            <NavLink to="/admin/notifications" className={navClass}>
              <FiBell />
              Notifications
              <span className="ml-auto h-2 w-2 rounded-full bg-accent" />
            </NavLink>
          </nav>

          <div className="border-t border-primary/20 pt-4">
            <NavLink to="/admin/settings" className={navClass}>
              <FiMoon />
              Settings
            </NavLink>
          </div>
        </aside>
      )}
    </>
  );
};

export default AdminNavbar;
