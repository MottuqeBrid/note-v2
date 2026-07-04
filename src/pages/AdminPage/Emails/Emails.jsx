import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArchive,
  FiCalendar,
  FiDownload,
  FiInbox,
  FiMail,
  FiPaperclip,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";
import { useAuth } from "../../../hooks/useAuth";
import useAxios from "../../../lib/useAxios";
import { getToken } from "../../../lib/localstoreage";
import StatCard from "../AdminNotes/StatCard";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const isAdminUser = (user) => {
  if (Array.isArray(user?.role)) return user.role.includes("admin");
  return user?.role === "admin";
};

const isDeletedEmail = (email) => Boolean(email?.isDeleted || email?.deleted);

const getOwner = (email) => {
  if (!email?.user || typeof email.user === "string") {
    return { name: "Unknown user", email: "" };
  }

  return {
    name: email.user.name || "Unknown user",
    email: email.user.email || "",
    profilePicture: email.user.profilePicture || "",
  };
};

const getMessageBody = (email) =>
  email?.text || email?.html?.replace(/<[^>]+>/g, " ") || "";

const getSearchText = (email) => {
  const owner = getOwner(email);

  return [
    email.email,
    email.from,
    email.to,
    email.subject,
    email.replyTo,
    owner.name,
    owner.email,
    getMessageBody(email),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const exportEmails = (emails) => {
  const rows = emails.map((email) => {
    const owner = getOwner(email);

    return {
      id: email._id,
      mailbox: email.email || "",
      owner: owner.name,
      ownerEmail: owner.email,
      from: email.from || "",
      to: email.to || "",
      subject: email.subject || "",
      replyTo: email.replyTo || "",
      attachments: email.attachments?.length || 0,
      status: isDeletedEmail(email) ? "Deleted" : "Active",
      receivedAt: formatDate(email.receivedAt),
      createdAt: formatDate(email.createdAt),
    };
  });

  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "admin-emails.json";
  link.click();
  URL.revokeObjectURL(url);
};

const Emails = () => {
  const app = useAxios();
  const token = getToken("token");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => isAdminUser(user), [user]);
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await app.get("admin/email", {
        headers: authHeaders,
      });
      const nextEmails = data?.emails || [];

      setEmails(nextEmails);
      setSelectedEmail((current) =>
        current && nextEmails.some((email) => email._id === current._id)
          ? current
          : nextEmails[0] || null,
      );
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const { data } = await app.get("admin/email", {
            headers: authHeaders,
          });
          const nextEmails = data?.emails || [];
          setEmails(nextEmails);
          setSelectedEmail(nextEmails[0] || null);
          return;
        } catch (fallbackError) {
          Swal.fire(
            "Error",
            fallbackError?.response?.data?.message || "Failed to load emails",
            "error",
          );
          return;
        }
      }

      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to load emails",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [app, authHeaders]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) navigate("/login", { replace: true });
  }, [authLoading, isAdmin, navigate, user]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    const timerId = setTimeout(() => fetchEmails(), 0);
    return () => clearTimeout(timerId);
  }, [authLoading, fetchEmails, isAdmin]);

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return emails;

    return emails.filter((email) => getSearchText(email).includes(query));
  }, [emails, search]);

  const stats = useMemo(
    () => ({
      total: emails.length,
      active: emails.filter((email) => !isDeletedEmail(email)).length,
      deleted: emails.filter(isDeletedEmail).length,
      mailboxes: new Set(emails.map((email) => email.email).filter(Boolean))
        .size,
      attachments: emails.reduce(
        (total, email) => total + (email.attachments?.length || 0),
        0,
      ),
    }),
    [emails],
  );

  if (authLoading) return <Loading />;

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Emails</h1>
            <p className="mt-1 text-sm text-neutral/60">
              Review every received email, mailbox, owner, attachment, and
              deleted status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex min-w-0 items-center gap-2 bg-base-100 sm:w-80">
              <FiSearch className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search emails..."
                className="grow"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-neutral/50 transition hover:text-primary"
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() => exportEmails(filteredEmails)}
              className="btn btn-outline btn-primary gap-2"
            >
              <FiDownload />
              Export
            </button>

            <button
              type="button"
              onClick={fetchEmails}
              className="btn btn-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FiRefreshCw />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<FiMail />} label="Emails" value={stats.total} />
          <StatCard icon={<FiArchive />} label="Active" value={stats.active} />
          <StatCard icon={<FiInbox />} label="Deleted" value={stats.deleted} />
          <StatCard
            icon={<FiUser />}
            label="Mailboxes"
            value={stats.mailboxes}
          />
          <StatCard
            icon={<FiPaperclip />}
            label="Attachments"
            value={stats.attachments}
          />
        </div>

        <p className="mt-4 text-sm text-neutral/60">
          Showing {filteredEmails.length} of {emails.length} email
          {emails.length !== 1 && "s"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : filteredEmails.length ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-primary/10 text-neutral">
                  <tr>
                    <th>Email</th>
                    <th>User</th>
                    <th>Mailbox</th>
                    <th>Assets</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => {
                    const owner = getOwner(email);
                    const deleted = isDeletedEmail(email);

                    return (
                      <tr
                        key={email._id}
                        onClick={() => setSelectedEmail(email)}
                        className={`cursor-pointer hover:bg-primary/5 ${
                          selectedEmail?._id === email._id
                            ? "bg-primary/10"
                            : ""
                        } ${deleted ? "opacity-65" : ""}`}
                      >
                        <td className="max-w-md">
                          <p className="font-semibold">
                            {email.subject || "(No subject)"}
                          </p>
                          <p className="mt-1 truncate text-sm text-neutral/60">
                            {email.from || "Unknown sender"}
                          </p>
                        </td>

                        <td>
                          <div className="flex min-w-44 items-center gap-2">
                            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary">
                              {owner.profilePicture ? (
                                <img
                                  src={owner.profilePicture}
                                  alt={owner.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FiUser />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {owner.name}
                              </p>
                              <p className="truncate text-xs text-neutral/50">
                                {owner.email || "No user email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-primary badge-outline">
                            {email.email || "Unknown mailbox"}
                          </span>
                        </td>

                        <td>
                          <span className="flex items-center gap-1 text-sm text-neutral/60">
                            <FiPaperclip className="text-primary" />
                            {email.attachments?.length || 0}
                          </span>
                        </td>

                        <td>
                          {deleted ? (
                            <span className="badge badge-error badge-sm">
                              Deleted
                            </span>
                          ) : (
                            <span className="badge badge-success badge-sm">
                              Active
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="flex items-center gap-2 text-sm text-neutral/60">
                            <FiCalendar className="text-primary" />
                            {formatDate(email.receivedAt || email.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center text-neutral/50">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <FiMail size={34} />
              </div>
              <p className="font-medium">
                {search ? "No emails match your search." : "No emails found."}
              </p>
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-primary/20 bg-base-100 shadow-sm">
          {selectedEmail ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-primary/10 p-5">
                <h2 className="text-xl font-bold">
                  {selectedEmail.subject || "(No subject)"}
                </h2>
                <p className="mt-2 text-sm text-neutral/60">
                  From: {selectedEmail.from || "Unknown"}
                </p>
                <p className="text-sm text-neutral/60">
                  To: {selectedEmail.to || selectedEmail.email || "Unknown"}
                </p>
                {selectedEmail.replyTo && (
                  <p className="text-sm text-neutral/60">
                    Reply to: {selectedEmail.replyTo}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral/45">
                  {formatDate(
                    selectedEmail.receivedAt || selectedEmail.createdAt,
                  )}
                </p>
              </div>

              <div className="space-y-5 p-5">
                {selectedEmail.text ? (
                  <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-base-300 bg-base-200/50 p-4 text-sm leading-6">
                    {selectedEmail.text}
                  </div>
                ) : selectedEmail.html ? (
                  <iframe
                    title="Admin email HTML preview"
                    sandbox=""
                    srcDoc={selectedEmail.html}
                    className="min-h-96 w-full rounded-lg border border-base-300 bg-white"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-base-300 p-8 text-center text-neutral/50">
                    No body content.
                  </div>
                )}

                {selectedEmail.attachments?.length > 0 && (
                  <div className="rounded-lg border border-base-300 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold">
                      <FiPaperclip className="text-primary" />
                      Attachments
                    </h3>
                    <div className="grid gap-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div
                          key={attachment?._id || attachment?.url || index}
                          className="flex items-center justify-between gap-3 rounded-lg bg-base-200/60 px-3 py-2 text-sm"
                        >
                          <span className="truncate">
                            {attachment?.filename ||
                              attachment?.name ||
                              attachment?.originalName ||
                              `Attachment ${index + 1}`}
                          </span>
                          {attachment?.url && (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-xs"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center gap-3 p-8 text-center text-neutral/50">
              <FiMail className="h-12 w-12 text-primary/60" />
              <p className="font-medium">Select an email to preview.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default Emails;
