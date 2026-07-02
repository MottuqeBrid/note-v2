import DataTable, { useTableExport } from "react-data-table-component";
import { forwardRef, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiDownload,
  FiEdit,
  FiFileText,
  FiMail,
  FiShield,
  FiTrash2,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import useTheme from "../../../hooks/useTheme";

const TableCheckbox = forwardRef((props, ref) => (
  <input
    {...props}
    ref={ref}
    type="checkbox"
    className="checkbox checkbox-primary checkbox-sm"
  />
));

TableCheckbox.displayName = "TableCheckbox";

const conditionalRowStyles = [
  {
    when: (row) => row.role === "admin",
    style: {
      fontWeight: 600,
    },
  },
  {
    when: (row) => row.isDeleted,
    style: {
      opacity: 0.65,
    },
  },
];

const customStyles = {
  table: {
    style: {
      backgroundColor: "var(--color-base-100)",
    },
  },
  headRow: {
    style: {
      minHeight: "52px",
      fontWeight: 700,
      color: "var(--color-neutral)",
      backgroundColor:
        "color-mix(in srgb, var(--color-primary) 8%, transparent)",
      borderBottom:
        "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
    },
  },
  rows: {
    style: {
      minHeight: "64px",
      color: "var(--color-neutral)",
      backgroundColor: "var(--color-base-100)",
      borderBottom:
        "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
    },
    highlightOnHoverStyle: {
      backgroundColor:
        "color-mix(in srgb, var(--color-primary) 8%, transparent)",
      transition: "0.2s ease",
    },
  },
  cells: {
    style: {
      paddingTop: "14px",
      paddingBottom: "14px",
    },
  },
  pagination: {
    style: {
      color: "var(--color-neutral)",
      backgroundColor: "var(--color-base-100)",
      borderTop:
        "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
    },
  },
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitial = (name = "U") => name.trim().charAt(0).toUpperCase();

const UserTable = ({ data = [], loading, onEdit, onDelete, search }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const columns = useMemo(
    () => [
      {
        name: "User",
        selector: (row) => row.name,
        sortable: true,
        grow: 1.4,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="avatar placeholder shrink-0">
              <div className="w-10 rounded-full bg-primary text-primary-content">
                <span className="text-sm font-bold">
                  {getInitial(row.name)}
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-neutral">
                {row.name || "Unnamed User"}
              </p>
              <p className="truncate text-xs text-neutral/60 md:hidden">
                {row.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        hide: "md",
        grow: 1.5,
        cell: (row) => (
          <span className="flex min-w-0 items-center gap-2 text-sm text-neutral/70">
            <FiMail className="shrink-0 text-primary" />
            <span className="truncate">{row.email}</span>
          </span>
        ),
      },
      {
        name: "Status",
        selector: (row) => row.isVerified,
        sortable: true,
        hide: "lg",
        cell: (row) =>
          row.isVerified ? (
            <span className="badge badge-primary badge-sm gap-1">
              <FiCheckCircle />
              Verified
            </span>
          ) : (
            <span className="badge badge-ghost badge-sm gap-1">
              <FiXCircle />
              Unverified
            </span>
          ),
      },
      {
        name: "Account",
        selector: (row) => row.isDeleted,
        sortable: true,
        hide: "lg",
        cell: (row) =>
          row.isDeleted ? (
            <span className="badge badge-error badge-sm gap-1">Deleted</span>
          ) : (
            <span className="badge badge-success badge-sm gap-1">Active</span>
          ),
      },
      {
        name: "Role",
        selector: (row) => row.role,
        sortable: true,
        cell: (row) => {
          const roleClass =
            row.role === "admin"
              ? "badge-primary"
              : row.role === "moderator"
                ? "badge-secondary"
                : "badge-ghost";

          return (
            <span className={`badge ${roleClass} badge-sm gap-1 capitalize`}>
              <FiShield />
              {row.role || "user"}
            </span>
          );
        },
      },
      {
        name: "Joined",
        selector: (row) => row.createdAt,
        sortable: true,
        hide: "lg",
        cell: (row) => (
          <span className="flex items-center gap-2 text-sm text-neutral/60">
            <FiCalendar className="text-primary" />
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        name: "Actions",
        button: true,
        right: true,
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            {onEdit && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square tooltip"
                data-tip="Edit user"
                onClick={() => onEdit(row)}
                aria-label={`Edit ${row.name}`}
              >
                <FiEdit className="text-primary" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square tooltip"
                data-tip="Delete user"
                onClick={() => onDelete(row)}
                aria-label={`Delete ${row.name}`}
              >
                <FiTrash2 className="text-error" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const exportColumns = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name || "" },
      { name: "Email", selector: (row) => row.email || "" },
      { name: "Role", selector: (row) => row.role || "user" },
      { name: "Verified", selector: (row) => (row.isVerified ? "Yes" : "No") },
      { name: "Deleted", selector: (row) => (row.isDeleted ? "Yes" : "No") },
      { name: "Joined", selector: (row) => formatDate(row.createdAt) },
    ],
    [],
  );

  const { download, copy } = useTableExport({
    columns: exportColumns,
    rows: data,
    valueSource: "selector",
  });

  const handleCopy = async (format) => {
    await copy(format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-primary/10 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral">All Users</h3>
          <p className="text-sm text-neutral/60">
            Manage users, roles, verification, and account status.
          </p>
        </div>

        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-primary btn-sm gap-2"
          >
            <FiDownload />
            Export
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content menu z-10 mt-2 w-48 rounded-box border border-primary/20 bg-base-100 p-2 shadow-xl"
          >
            <li>
              <button type="button" onClick={() => download("users.csv")}>
                <FiFileText />
                Download CSV
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => download("users.json", "json")}
              >
                <FiFileText />
                Download JSON
              </button>
            </li>

            <li>
              <button type="button" onClick={() => handleCopy("csv")}>
                {copied ? (
                  <>
                    <FiCheck className="text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <FiClipboard />
                    Copy CSV
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 25, 50]}
        responsive
        highlightOnHover
        progressPending={loading}
        progressComponent={
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        }
        noDataComponent={
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-neutral/50">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FiUser size={32} />
            </div>
            <p className="font-medium">
              {search ? "No users match your search." : "No users found."}
            </p>
          </div>
        }
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        fixedHeader
        selectableRows
        selectableRowsComponent={TableCheckbox}
        colorMode={theme === "dark" ? "dark" : "light"}
      />
    </section>
  );
};

export default UserTable;
