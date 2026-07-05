import { FiInbox, FiPaperclip, FiSearch, FiX } from "react-icons/fi";

const MessageList = ({
  selectedMailbox,
  search,
  setSearch,
  loadingMessages,
  filteredMessages,
  selectedMessage,
  setSelectedMessage,
  formatDate,
  getMessageBody,
}) => {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
      <div className="border-b border-primary/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-bold">Messages</h2>
            <p className="truncate text-sm text-neutral/50">
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
        <label className="input input-bordered mt-3 flex min-w-0 items-center gap-2">
          <FiSearch className="text-primary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 grow"
            placeholder="Search sender, subject, body..."
          />
        </label>
      </div>

      {loadingMessages ? (
        <div className="flex min-h-96 items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : filteredMessages.length ? (
        <div className="max-h-112 overflow-y-auto sm:max-h-136 xl:max-h-[calc(100vh-17rem)]">
          {filteredMessages.map((message) => (
            <button
              key={message._id}
              type="button"
              onClick={() => setSelectedMessage(message)}
              className={`w-full border-b border-base-300 p-4 text-left transition hover:bg-primary/5 ${
                selectedMessage?._id === message._id ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
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
  );
};

export default MessageList;
