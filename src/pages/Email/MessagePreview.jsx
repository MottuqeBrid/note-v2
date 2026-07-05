import { FiMail, FiPaperclip, FiTrash2 } from "react-icons/fi";

const MessagePreview = ({
  selectedMessage,
  handleDeleteMessage,
  deletingId,
  formatDate,
  selectedMailbox,
  getAttachmentName,
}) => {
  console.log("selectedMessage:", selectedMessage);
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
      {selectedMessage ? (
        <div className="flex h-full flex-col">
          <div className="border-b border-primary/10 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="wrap-break-word text-lg font-bold sm:text-xl">
                  {selectedMessage.subject || "(No subject)"}
                </h2>
                <p className="mt-2 break-all text-sm text-neutral/60">
                  From: {selectedMessage.from || "Unknown"}
                </p>
                <p className="break-all text-sm text-neutral/60">
                  To: {selectedMessage.to || selectedMailbox}
                </p>
                {selectedMessage.replyTo && (
                  <p className="break-all text-sm text-neutral/60">
                    Reply to: {selectedMessage.replyTo}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral/45">
                  {formatDate(
                    selectedMessage.receivedAt || selectedMessage.createdAt,
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMessage(selectedMessage)}
                disabled={deletingId === selectedMessage._id}
                className="btn btn-error btn-outline btn-sm w-full gap-2 sm:w-auto"
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

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
            {selectedMessage.html ? (
              <iframe
                title="Email HTML preview"
                sandbox=""
                srcDoc={selectedMessage.html}
                className="min-h-80 w-full rounded-lg border border-base-300 bg-white sm:min-h-96"
              />
            ) : selectedMessage.text ? (
              <div className="whitespace-pre-wrap wrap-break-word rounded-lg border border-base-300 bg-base-200/50 p-4 text-sm leading-6">
                {selectedMessage.text}
              </div>
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
                  {selectedMessage.attachments.map((attachment, index) => (
                    <div
                      key={attachment?._id || attachment?.url || index}
                      className="flex flex-col gap-2 rounded-lg bg-base-200/60 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <span className="min-w-0 wrap-break-word">
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center text-neutral/50">
          <FiMail className="h-12 w-12 text-primary/60" />
          <p className="font-medium">Select an email to preview.</p>
        </div>
      )}
    </section>
  );
};

export default MessagePreview;
