import { FiCopy, FiMail, FiTrash2, FiUser } from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const MailboxList = ({
  selectedMailbox,
  mailboxes,
  loadingMailboxes,
  handleMailboxSelect,
  fetchMailboxes,
}) => {
  const app = useAxios();
  const token = getToken("token");
  const handleDeleteMailbox = async (e, mailbox) => {
    e.stopPropagation(); // Prevent the click from selecting the mailbox
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the mailbox "${mailbox}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#22c55e",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data } = await app.delete("/email", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            email: mailbox,
          },
        });
        if (data.success) {
          toast.success(data.message);
          await fetchMailboxes();
        }
      }
    });
  };
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <FiMail className="text-primary" /> Mailboxes
        </h2>
        <span className="badge badge-primary badge-sm">{mailboxes.length}</span>
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
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition hover:border-primary hover:bg-primary/5 ${
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
              {selectedMailbox === mail && (
                <span className="badge badge-primary badge-sm">Selected</span>
              )}
              <span
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={(e) => handleDeleteMailbox(e, mail)}
              >
                <FiTrash2 />
              </span>
              <span
                type="button"
                className="btn btn-ghost btn-sm btn-square cursor-copy"
                onClick={() => navigator.clipboard.writeText(mail)}
              >
                <FiCopy />
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
  );
};

export default MailboxList;
