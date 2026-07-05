import {
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiImage,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxios from "./../../lib/useAxios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getToken } from "../../lib/localstoreage";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitial = (name = "U") => name.trim().charAt(0).toUpperCase();

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const app = useAxios();
  const navigate = useNavigate();
  const getProfile = async () => {
    try {
      const token = getToken("token");
      const { data } = await app.get(`user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
      toast.error("You are not logged in");
    }
    const lodeProfile = async () => {
      await getProfile();
    };
    lodeProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, navigate]);

  if (loading || !profile) return <Loading />;

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="h-20 w-20 rounded-full border border-primary/20 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-content">
                {getInitial(profile.name)}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{profile.name}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral/60">
                <FiMail className="text-primary" />
                {profile.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary gap-1 capitalize">
                <FiShield />
                {profile.role || "user"}
              </span>

              {profile.isVerified ? (
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

              {profile.isDeleted && (
                <span className="badge badge-error gap-1">
                  <FiXCircle />
                  Deleted
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate("/update-profile", { state: { id: profile._id } })
                }
                className="btn btn-primary"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<FiUser />}
          label="Notes"
          value={profile.notes?.length || 0}
        />
        <StatCard
          icon={<FiFolder />}
          label="Folders"
          value={profile.folders?.length || 0}
        />
        <StatCard
          icon={<FiImage />}
          label="Images"
          value={profile.images?.length || 0}
        />
      </div>

      <div className="rounded-xl border border-primary/20 bg-base-100 p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">Account Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem icon={<FiUser />} label="Full Name" value={profile.name} />
          <InfoItem icon={<FiMail />} label="Email" value={profile.email} />
          <InfoItem
            icon={<FiPhone />}
            label="Phone Number"
            value={profile.phoneNumber || "Not added"}
          />
          <InfoItem
            icon={<FiShield />}
            label="Role"
            value={profile.role || "user"}
            capitalize
          />
          <InfoItem
            icon={<FiClock />}
            label="Joined"
            value={formatDate(profile.createdAt)}
          />
          <InfoItem
            icon={<FiClock />}
            label="Last Updated"
            value={formatDate(profile.updatedAt)}
          />
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
    <div className="mb-3 text-primary">{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-neutral/60">{label}</p>
  </div>
);

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

export default Profile;
