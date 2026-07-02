import DataTable, { useTableExport } from "react-data-table-component";
import {
  FiUser,
  FiMail,
  FiCheck,
  FiCalendar,
  FiShield,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiFileText,
  FiClipboard,
} from "react-icons/fi";
import useTheme from "../../../hooks/useTheme";
import { forwardRef, useState } from "react";

const conditionalRowStyles = [
  {
    when: (row) => row.role === "admin",
    style: { fontWeight: "600" },
  },
];

const customStyles = {
  headRow: {
    style: {
      fontWeight: 600,
      borderBottomWidth: 2,
    },
  },
  cells: {
    style: { paddingTop: 12, paddingBottom: 12 },
  },
  pagination: {
    style: { borderTopWidth: 2 },
  },
};

const UserTable = ({ data = [], loading, onEdit, onDelete, search }) => {
  const { theme } = useTheme();
  const columns = [
    {
      name: "User",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="w-10 rounded-full bg-primary/10 text-primary">
              <FiUser />
            </div>
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-base-content/50 md:hidden">
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
      cell: (row) => (
        <span className="flex items-center gap-1 text-sm">
          <FiMail className="text-base-content/40" />
          {row.email}
        </span>
      ),
    },
    {
      name: "Verified",
      selector: (row) => row.isVerified,
      sortable: true,
      hide: "lg",
      cell: (row) => (
        <span className="flex items-center gap-1 text-sm text-base-content/60">
          <FiCheck className="text-base-content/40" />
          {row.isVerified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      name: "Deleted",
      selector: (row) => row.isDeleted,
      sortable: true,
      hide: "lg",
      cell: (row) => (
        <span className="flex items-center gap-1 text-sm text-base-content/60">
          <FiCheck className="text-base-content/40" />
          {row.isDeleted ? "Yes" : "No"}
        </span>
      ),
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span
          className={`badge ${row.role === "admin" ? "badge-primary" : row.role === "moderator" ? "badge-info" : "badge-ghost"} gap-1 text-xs font-medium`}
        >
          <FiShield />
          {row.role}
        </span>
      ),
    },
    {
      name: "Joined",
      selector: (row) => row.createdAt,
      sortable: true,
      hide: "lg",
      cell: (row) => (
        <span className="flex items-center gap-1 text-sm text-base-content/60">
          <FiCalendar />
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      name: "Actions",
      button: true,
      right: true,
      cell: (row) => (
        <div className="flex gap-1">
          {onEdit && (
            <button
              className="btn btn-ghost btn-sm btn-square tooltip"
              data-tip="Edit"
              onClick={() => onEdit(row)}
            >
              <FiEdit className="text-info" />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-sm btn-square tooltip"
              data-tip="Delete"
              onClick={() => onDelete(row)}
            >
              <FiTrash2 className="text-error" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const MyCheckbox = forwardRef((props, ref) => (
    <input
      {...props}
      ref={ref}
      style={{ accentColor: "teal", width: 18, height: 18 }}
    />
  ));
  MyCheckbox.displayName = "MyCheckbox";

  const [copied, setCopied] = useState(false);
  const { download, copy } = useTableExport({
    columns,
    rows: data,
    valueSource: "format",
  });

  async function handleCopy(format) {
    await copy(format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          All Users
        </h3>
        <div className="flex items-center gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm gap-1"
            >
              <FiDownload />
              Export
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-10 w-44 p-2 shadow-sm border border-base-200"
            >
              <li>
                <button onClick={() => download("users.csv")}>
                  <FiFileText /> Download CSV
                </button>
              </li>
              <li>
                <button onClick={() => download("users.json", "json")}>
                  <FiFileText /> Download JSON
                </button>
              </li>
              <li>
                <button onClick={() => handleCopy("csv")}>
                  {copied ? (
                    <>
                      <FiCheck className="text-success" /> Copied!
                    </>
                  ) : (
                    <>
                      <FiClipboard /> Copy CSV
                    </>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 25, 50]}
        sortable
        responsive
        highlightOnHover
        striped
        progressPending={loading}
        progressComponent={
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        }
        noDataComponent={
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-base-content/40">
            <FiUser size={32} />
            <p>{search ? "No users match your search." : "No users found."}</p>
          </div>
        }
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        fixedHeader
        colorMode={theme === "dark" ? "dark" : "light"}
        theme="catppuccin"
        selectableRows
        selectableRowsComponent={MyCheckbox}
      />
    </div>
  );
};

export default UserTable;
