import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiAlertCircle,
  FiInbox,
  FiMail,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";
import MailboxList from "./MailboxList";
import MessageList from "./MessageList";
import MessagePreview from "./MessagePreview";

const EMAIL_DOMAINS = ["brid.bd"];

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
  const [selectedDomain, setSelectedDomain] = useState(EMAIL_DOMAINS[0]);
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
    if (!EMAIL_DOMAINS.includes(selectedDomain)) {
      toast.error("Please select a valid email domain");
      return;
    }

    const username = newEmail
      .split("@")[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");
    const email = `${username}@${selectedDomain}`;

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
                <select
                  value={selectedDomain}
                  onChange={(event) => setSelectedDomain(event.target.value)}
                  className="select select-bordered join-item max-w-36"
                  aria-label="Email domain"
                >
                  {EMAIL_DOMAINS.map((domain) => (
                    <option key={domain} value={domain}>
                      @{domain}
                    </option>
                  ))}
                </select>
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
          <MailboxList
            selectedMailbox={selectedMailbox}
            mailboxes={mailboxes}
            loadingMailboxes={loadingMailboxes}
            handleMailboxSelect={handleMailboxSelect}
            fetchMailboxes={fetchMailboxes}
          />
        </aside>

        {/* Messages + Preview */}
        <div className="grid min-h-170 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Message list */}

          <MessageList
            selectedMailbox={selectedMailbox}
            search={search}
            setSearch={setSearch}
            loadingMessages={loadingMessages}
            filteredMessages={filteredMessages}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            formatDate={formatDate}
            getMessageBody={getMessageBody}
          />

          {/* Message preview */}
          <MessagePreview
            selectedMessage={selectedMessage}
            handleDeleteMessage={handleDeleteMessage}
            deletingId={deletingId}
            formatDate={formatDate}
            selectedMailbox={selectedMailbox}
            getAttachmentName={getAttachmentName}
          />
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-neutral/70">
        <p className="mb-1 flex items-center gap-2 font-semibold text-neutral">
          <FiAlertCircle className="text-warning" /> Notice:
        </p>
        <p>
          Use this email feature responsibly. Avoid sending spam or malicious
          content. New inbox addresses can only use approved domains:{" "}
          {EMAIL_DOMAINS.map((domain) => `@${domain}`).join(", ")}.
        </p>
      </div>
    </section>
  );
};

export default Email;
