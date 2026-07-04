import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiAlertCircle,
  FiInbox,
  FiMail,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown date";

const getMessageBody = (message) =>
  message?.text || message?.html?.replace(/<[^>]+>/g, " ") || "";

const getAttachmentName = (attachment, index) =>
  attachment?.filename ||
  attachment?.name ||
  attachment?.originalName ||
  `Attachment ${index + 1}`;

const Email = () => {
  const app = useAxios();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const token = getToken("token");

  const [mailboxes, setMailboxes] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [search, setSearch] = useState("");
  const [loadingMailboxes, setLoadingMailboxes] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  // ✅ fetchMessages — no loop dependency
  const fetchMessages = useCallback(
    async (mail) => {
      if (!mail) {
        setMessages([]);
        setSelectedMessage(null);
        return;
      }
      try {
        setLoadingMessages(true);
        const { data } = await app.get(`email/${mail}`, {
          headers: authHeaders,
        });
        const inbox = Array.isArray(data?.emails) ? data.emails : [];
        setMessages(inbox);
        setSelectedMessage(inbox[0] || null);
      } catch (error) {
        if (error.response?.status === 404) {
          setMessages([]);
          setSelectedMessage(null);
          return;
        }
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to load emails",
          "error",
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [app, authHeaders],
  );

  // ✅ fetchMailboxes — selectedMailbox সরানো dep থেকে
  const fetchMailboxes = useCallback(
    async (notify = false) => {
      try {
        setLoadingMailboxes(true);
        const { data } = await app.get("email", { headers: authHeaders });
        const nextMailboxes = Array.isArray(data?.emails) ? data.emails : [];

        setMailboxes(nextMailboxes);
        if (notify) toast.success(data?.message || "Email addresses refreshed");

        // functional update — dep এ selectedMailbox লাগবে না
        setSelectedMailbox((prev) => {
          return prev && nextMailboxes.includes(prev)
            ? prev
            : nextMailboxes[0] || "";
        });
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to load email addresses",
          "error",
        );
      } finally {
        setLoadingMailboxes(false);
      }
    },
    [app, authHeaders], // ✅ selectedMailbox নেই
  );

  // auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, navigate, user]);

  // initial load
  useEffect(() => {
    if (authLoading || !user) return;
    const id = setTimeout(() => fetchMailboxes(), 0);
    return () => clearTimeout(id);
  }, [authLoading, fetchMailboxes, user]);

  // ✅ selectedMailbox change হলে messages fetch — loop নেই
  useEffect(() => {
    if (selectedMailbox) {
      const lode = () => {
        fetchMessages(selectedMailbox);
      };
      lode();
    }
  }, [selectedMailbox, fetchMessages]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) =>
      [
        message.from,
        message.to,
        message.subject,
        message.replyTo,
        getMessageBody(message),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [messages, search]);

  const handleMailboxSelect = (mail) => {
    setSelectedMailbox(mail);
    setSearch("");
    // ✅ useEffect handles fetchMessages automatically
  };

  const handleAddEmail = async (event) => {
    event.preventDefault();
    if (newEmail.trim() === "") {
      toast.error("Email username cannot be empty");
      return;
    }
    if (newEmail.includes("@")) {
      toast.error("Please enter only the username part (before @)");
      return;
    }
    const email = newEmail.split("@")[0].trim().toLowerCase() + "@brid.bd";

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setAddingEmail(true);
      const { data } = await app.post(
        "email",
        { email },
        { headers: authHeaders },
      );
      toast.success(data?.message || "Email address added");
      setNewEmail("");
      await fetchMailboxes();
      // ✅ set after fetchMailboxes so mailboxes list updated first
      setSelectedMailbox(email);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add email address",
        "error",
      );
    } finally {
      setAddingEmail(false);
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!message?._id) return;

    const result = await Swal.fire({
      title: "Delete email?",
      text: message.subject || "This message will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#22c55e",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(message._id);
      const { data } = await app.delete(`email/${message._id}`, {
        headers: authHeaders,
      });
      toast.success(data?.message || "Email deleted");
      setMessages((current) =>
        current.filter((item) => item._id !== message._id),
      );
      setSelectedMessage((current) =>
        current?._id === message._id
          ? messages.find((item) => item._id !== message._id) || null
          : current,
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete email",
        "error",
      );
    } finally {
      setDeletingId("");
    }
  };

  if (authLoading) return <Loading />;
  if (!user) return null;

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      {/* Header */}
      <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Inbox
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Email</h1>
            <p className="mt-1 text-sm text-neutral/60">
              Add mailbox addresses, view received messages, and delete emails
              you no longer need.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchMailboxes(true)}
            className="btn btn-primary gap-2"
            disabled={loadingMailboxes || loadingMessages}
          >
            {loadingMailboxes || loadingMessages ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiRefreshCw />
            )}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: FiMail, label: "Mailboxes", value: mailboxes.length },
            { icon: FiInbox, label: "Messages", value: messages.length },
            {
              icon: FiPaperclip,
              label: "Attachments",
              value: messages.reduce(
                (total, m) => total + (m.attachments?.length || 0),
                0,
              ),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-primary/10 bg-primary/5 p-4"
            >
              <Icon className="mb-2 text-primary" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-neutral/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Sidebar */}
        <aside className="space-y-4 rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
          {/* Add email form */}
          <form onSubmit={handleAddEmail} className="space-y-3">
            <label className="form-control">
              <span className="label">
                <span className="label-text font-semibold">
                  Add email address
                </span>
              </span>
              <div className="join w-full">
                <label className="input validator join-item w-full">
                  <FiMail />
                  <input
                    type="text"
                    name="email"
                    placeholder="mail username"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input input-bordered w-full focus:outline-none"
                  />
                </label>
                <span className="btn join-item">@brid.bd</span>
                <button
                  type="submit"
                  disabled={addingEmail}
                  className="btn btn-primary join-item"
                >
                  {addingEmail ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FiPlus />
                  )}
                </button>
              </div>
            </label>
          </form>

          {/* Mailbox list */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold">
                <FiMail className="text-primary" /> Mailboxes
              </h2>
              <span className="badge badge-primary badge-sm">
                {mailboxes.length}
              </span>
            </div>

            <div className="space-y-2">
              {loadingMailboxes ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : mailboxes.length ? (
                mailboxes.map((mail) => (
                  <button
                    key={mail}
                    type="button"
                    onClick={() => handleMailboxSelect(mail)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:border-primary hover:bg-primary/5 ${
                      selectedMailbox === mail
                        ? "border-primary bg-primary/10"
                        : "border-base-300"
                    }`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <FiUser />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {mail}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-base-300 p-5 text-center text-sm text-neutral/50">
                  No email addresses added yet.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Messages + Preview */}
        <div className="grid min-h-170 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Message list */}
          <section className="rounded-xl border border-primary/20 bg-base-100 shadow-sm">
            <div className="border-b border-primary/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">Messages</h2>
                  <p className="text-sm text-neutral/50">
                    {selectedMailbox || "Select a mailbox"}
                  </p>
                </div>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="btn btn-ghost btn-sm btn-square"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <label className="input input-bordered mt-3 flex items-center gap-2">
                <FiSearch className="text-primary" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="grow"
                  placeholder="Search sender, subject, body..."
                />
              </label>
            </div>

            {loadingMessages ? (
              <div className="flex min-h-96 items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : filteredMessages.length ? (
              <div className="max-h-155 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <button
                    key={message._id}
                    type="button"
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full border-b border-base-300 p-4 text-left transition hover:bg-primary/5 ${
                      selectedMessage?._id === message._id
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {message.subject || "(No subject)"}
                        </p>
                        <p className="mt-1 truncate text-sm text-neutral/60">
                          {message.from || "Unknown sender"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral/45">
                        {formatDate(message.receivedAt || message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral/55">
                      {getMessageBody(message) || "No message body"}
                    </p>
                    {message.attachments?.length > 0 && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                        <FiPaperclip />
                        {message.attachments.length} attachment
                        {message.attachments.length !== 1 && "s"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-96 flex-col items-center justify-center gap-3 p-6 text-center text-neutral/50">
                <FiInbox className="h-12 w-12 text-primary/60" />
                <p className="font-medium">
                  {search ? "No emails match your search." : "No emails found."}
                </p>
              </div>
            )}
          </section>

          {/* Message preview */}
          <section className="rounded-xl border border-primary/20 bg-base-100 shadow-sm">
            {selectedMessage ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-primary/10 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold">
                        {selectedMessage.subject || "(No subject)"}
                      </h2>
                      <p className="mt-2 text-sm text-neutral/60">
                        From: {selectedMessage.from || "Unknown"}
                      </p>
                      <p className="text-sm text-neutral/60">
                        To: {selectedMessage.to || selectedMailbox}
                      </p>
                      {selectedMessage.replyTo && (
                        <p className="text-sm text-neutral/60">
                          Reply to: {selectedMessage.replyTo}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-neutral/45">
                        {formatDate(
                          selectedMessage.receivedAt ||
                            selectedMessage.createdAt,
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(selectedMessage)}
                      disabled={deletingId === selectedMessage._id}
                      className="btn btn-error btn-outline btn-sm gap-2"
                    >
                      {deletingId === selectedMessage._id ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <FiTrash2 />
                      )}
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                  {selectedMessage.text ? (
                    <div className="whitespace-pre-wrap rounded-lg border border-base-300 bg-base-200/50 p-4 text-sm leading-6">
                      {selectedMessage.text}
                    </div>
                  ) : selectedMessage.html ? (
                    <iframe
                      title="Email HTML preview"
                      sandbox=""
                      srcDoc={selectedMessage.html}
                      className="min-h-96 w-full rounded-lg border border-base-300 bg-white"
                    />
                  ) : (
                    <div className="rounded-lg border border-dashed border-base-300 p-8 text-center text-neutral/50">
                      No body content.
                    </div>
                  )}

                  {selectedMessage.attachments?.length > 0 && (
                    <div className="rounded-lg border border-base-300 p-4">
                      <h3 className="mb-3 flex items-center gap-2 font-bold">
                        <FiPaperclip className="text-primary" /> Attachments
                      </h3>
                      <div className="grid gap-2">
                        {selectedMessage.attachments.map(
                          (attachment, index) => (
                            <div
                              key={attachment?._id || attachment?.url || index}
                              className="flex items-center justify-between gap-3 rounded-lg bg-base-200/60 px-3 py-2 text-sm"
                            >
                              <span className="truncate">
                                {getAttachmentName(attachment, index)}
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
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center text-neutral/50">
                <FiMail className="h-12 w-12 text-primary/60" />
                <p className="font-medium">Select an email to preview.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-neutral/70">
        <p className="mb-1 flex items-center gap-2 font-semibold text-neutral">
          <FiAlertCircle className="text-warning" /> Notice:
        </p>
        <p>
          Use this email feature responsibly. Avoid sending spam or malicious
          content. The system may monitor and restrict accounts that violate
          these guidelines.
        </p>
      </div>
    </section>
  );
};

export default Email;
