import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiFolder,
  FiImage,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";
import { useAuth } from "../../../hooks/useAuth";
import useAxios from "../../../lib/useAxios";
import { getToken } from "../../../lib/localstoreage";
import UserModal from "../Users/UserModal";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitial = (name = "U") => name.trim().charAt(0).toUpperCase();

const SingleUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const app = useAxios();
  const token = getToken("token");

  const isAdmin = useMemo(() => {
    if (Array.isArray(user?.role)) return user.role.includes("admin");
    return user?.role === "admin";
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await app.get(`admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && data?.success) {
          setUserData(data.user || null);
        }
      } catch (error) {
        if (!cancelled) {
          Swal.fire(
            "Error",
            error?.response?.data?.message || "Failed to load user",
            "error",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAdmin, id, app, token]);

  if (authLoading || loading) return <Loading />;

  if (!userData) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-neutral">
        <p className="text-neutral/60">User not found.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt={userData.name}
                className="h-20 w-20 rounded-full border border-primary/20 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-content">
                {getInitial(userData.name)}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                {userData.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral/60">
                <FiMail className="text-primary" />
                {userData.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary gap-1 capitalize">
                <FiShield />
                {userData.role || "user"}
              </span>

              {userData.isVerified ? (
                <span className="badge badge-success gap-1">
                  <FiCheckCircle />
                  Verified
                </span>
              ) : (
                <span className="badge badge-warning gap-1">
                  <FiXCircle />
                  Unverified
                </span>
              )}

              {userData.isDeleted && (
                <span className="badge badge-error gap-1">
                  <FiXCircle />
                  Deleted
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(userData)}
                className="btn btn-primary gap-2"
              >
                <FiEdit />
                Edit
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="btn btn-ghost"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
          <div className="mb-3 text-primary">
            <FiUser />
          </div>
          <p className="text-2xl font-bold">{userData.notes?.length || 0}</p>
          <p className="text-sm text-neutral/60">Notes</p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
          <div className="mb-3 text-primary">
            <FiFolder />
          </div>
          <p className="text-2xl font-bold">{userData.folders?.length || 0}</p>
          <p className="text-sm text-neutral/60">Folders</p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
          <div className="mb-3 text-primary">
            <FiImage />
          </div>
          <p className="text-2xl font-bold">{userData.images?.length || 0}</p>
          <p className="text-sm text-neutral/60">Images</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-base-100 p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">Account Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem icon={<FiUser />} label="Full Name" value={userData.name} />
          <InfoItem icon={<FiMail />} label="Email" value={userData.email} />
          <InfoItem
            icon={<FiPhone />}
            label="Phone Number"
            value={userData.phoneNumber || "Not added"}
          />
          <InfoItem
            icon={<FiShield />}
            label="Role"
            value={userData.role || "user"}
            capitalize
          />
          {userData.level != null && (
            <InfoItem
              icon={<FiShield />}
              label="Level"
              value={`L${userData.level}`}
            />
          )}
          <InfoItem
            icon={<FiClock />}
            label="Joined"
            value={formatDate(userData.createdAt)}
          />
          <InfoItem
            icon={<FiClock />}
            label="Last Updated"
            value={formatDate(userData.updatedAt)}
          />
          <InfoItem
            icon={<FiUser />}
            label="User ID"
            value={userData._id || id}
          />
        </div>

        {userData.emails?.length > 0 && (
          <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <FiMail />
              All Emails
            </p>
            <div className="flex flex-wrap gap-2">
              {userData.emails.map((email, index) => (
                <span
                  key={index}
                  className="badge badge-outline badge-primary"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <UserModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        setUsers={(updater) => {
          const updated =
            typeof updater === "function" ? updater([userData]) : updater;
          if (updated?.[0]) setUserData(updated[0]);
        }}
      />
    </section>
  );
};

const InfoItem = ({ icon, label, value, capitalize }) => (
  <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
      {icon}
      {label}
    </p>
    <p
      className={`font-semibold text-neutral ${capitalize ? "capitalize" : ""}`}
    >
      {value}
    </p>
  </div>
);

export default SingleUser;
