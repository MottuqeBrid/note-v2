// UpdateProfile.jsx
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiCamera,
  FiSave,
} from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);

  const app = useAxios();
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const token = getToken("token");
  const imageInputRef = useRef(null);
  const emailTimeoutRef = useRef(null);
  const phoneTimeoutRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      profilePicture: "",
    },
  });

  // ─── Load Profile ───
  const getProfile = async () => {
    try {
      setLoading(true);
      const { data } = await app.get(`user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = data.user;
      setProfile(user);
      setValue("name", user.name ?? "");
      setValue("email", user.email ?? "");
      setValue("phoneNumber", user.phoneNumber ?? "");
      setValue("profilePicture", user.profilePicture ?? "");
      if (user.profilePicture) setPreviewImage(user.profilePicture);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!state?.id) {
      navigate("/profile");
      return;
    }
    const lodeProfile = async () => await getProfile();
    lodeProfile();
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      if (phoneTimeoutRef.current) clearTimeout(phoneTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Email check ───
  const handleEmailChange = (e) => {
    const value = e.target.value;
    clearErrors("email");

    if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
    if (!value || value === profile?.email) return;

    emailTimeoutRef.current = setTimeout(async () => {
      if (!/\S+@\S+\.\S+/.test(value)) return;
      setEmailChecking(true);
      try {
        const { data } = await app.get(`user?email=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.success) {
          setError("email", { message: "Email already in use" });
        }
      } catch {
        // available ✅
      } finally {
        setEmailChecking(false);
      }
    }, 600);
  };

  // ─── Phone check ───
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    clearErrors("phoneNumber");

    if (phoneTimeoutRef.current) clearTimeout(phoneTimeoutRef.current);
    if (!value || value === profile?.phoneNumber) return;

    phoneTimeoutRef.current = setTimeout(async () => {
      setPhoneChecking(true);
      try {
        const { data } = await app.get(`user?phoneNumber=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.success) {
          setError("phoneNumber", { message: "Phone number already in use" });
        }
      } catch {
        // available ✅
      } finally {
        setPhoneChecking(false);
      }
    }, 600);
  };

  // ─── Image Upload ───
  const uploadProfileImage = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const { data } = await app.post(`upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data.files?.[0]?.url ?? null;
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMsg("Image upload failed");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be under 5MB");
      return;
    }
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
    setErrorMsg("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  // ─── Submit ───
  const onSubmit = async (formData) => {
    if (errors.email || errors.phoneNumber) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let profilePictureUrl = formData.profilePicture;

      if (selectedImageFile) {
        const url = await uploadProfileImage(selectedImageFile);
        if (url) profilePictureUrl = url;
      }
      console.log(profilePictureUrl);
      await app.patch(
        `user/profile`,
        { ...formData, profilePicture: profilePictureUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-ghost"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Update Profile</h1>
            <p className="text-sm text-gray-500">
              Edit your personal information
            </p>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-lg p-6 md:p-8">
          {/* Alerts */}
          {successMsg && (
            <div className="alert alert-success mb-4 text-sm flex gap-2">
              <FiCheckCircle className="text-lg shrink-0" /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-error mb-4 text-sm flex gap-2">
              <FiAlertCircle className="text-lg shrink-0" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ─── Profile Picture ─── */}
            <div className="flex flex-col items-center mb-8">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => imageInputRef.current?.click()}
                className={`relative w-32 h-32 rounded-full cursor-pointer border-4 transition-all ${
                  dragOver
                    ? "border-primary scale-105"
                    : "border-primary/30 hover:border-primary"
                }`}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    <FiUser className="text-4xl text-primary/50" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-all gap-1">
                  <FiCamera className="text-white text-xl" />
                  <span className="text-white text-xs font-medium">
                    {uploadingImage ? "Uploading..." : "Change"}
                  </span>
                </div>

                {/* Uploading Spinner */}
                {uploadingImage && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-white" />
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                />
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Click or drag to change photo · Max 5MB
              </p>
              {selectedImageFile && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <FiCheckCircle /> {selectedImageFile.name} selected
                </p>
              )}
            </div>

            {/* ─── Role Badge ─── */}
            {profile?.role && (
              <div className="flex justify-center mb-6">
                <span
                  className={`badge badge-lg font-medium ${
                    profile.role === "admin"
                      ? "badge-error"
                      : profile.role === "moderator"
                        ? "badge-warning"
                        : "badge-primary"
                  }`}
                >
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            )}

            {/* ─── Form Fields ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-1">
                    <FiUser className="text-primary" /> Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name", { required: "Name is required" })}
                  className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <FiAlertCircle /> {errors.name.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-1">
                    <FiMail className="text-primary" /> Email *
                  </span>
                  {emailChecking && (
                    <span className="label-text-alt flex items-center gap-1 text-gray-400">
                      <span className="loading loading-spinner loading-xs" />{" "}
                      Checking...
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email address",
                    },
                  })}
                  onChange={handleEmailChange}
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                />
                {errors.email ? (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <FiAlertCircle /> {errors.email.message}
                    </span>
                  </label>
                ) : getValues("email") &&
                  getValues("email") !== profile?.email &&
                  !emailChecking ? (
                  <label className="label">
                    <span className="label-text-alt text-success flex items-center gap-1">
                      <FiCheckCircle /> Email available
                    </span>
                  </label>
                ) : null}
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-1">
                    <FiPhone className="text-primary" /> Phone Number
                  </span>
                  {phoneChecking && (
                    <span className="label-text-alt flex items-center gap-1 text-gray-400">
                      <span className="loading loading-spinner loading-xs" />{" "}
                      Checking...
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  placeholder="+880 1234 567890"
                  {...register("phoneNumber")}
                  onChange={handlePhoneChange}
                  className={`input input-bordered w-full ${errors.phoneNumber ? "input-error" : ""}`}
                />
                {errors.phoneNumber ? (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <FiAlertCircle /> {errors.phoneNumber.message}
                    </span>
                  </label>
                ) : getValues("phoneNumber") &&
                  getValues("phoneNumber") !== profile?.phoneNumber &&
                  !phoneChecking ? (
                  <label className="label">
                    <span className="label-text-alt text-success flex items-center gap-1">
                      <FiCheckCircle /> Phone available
                    </span>
                  </label>
                ) : null}
              </div>

              {/* Account Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Account Status</span>
                </label>
                <div className="input input-bordered w-full flex items-center gap-2 bg-base-200 cursor-not-allowed">
                  {profile?.isVerified ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <FiCheckCircle /> Verified
                    </span>
                  ) : (
                    <span className="text-warning flex items-center gap-1">
                      <FiAlertCircle /> Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Account Info ─── */}
            <div className="mt-6 p-4 bg-base-200 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Account Info
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Member Since</p>
                  <p className="font-medium">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Notes</p>
                  <p className="font-medium">{profile?.notes?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">User ID</p>
                  <p className="font-mono text-xs truncate">{profile?._id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Folders</p>
                  <p className="font-medium">{profile?.folders?.length ?? 0}</p>
                </div>
              </div>
            </div>

            {/* ─── Buttons ─── */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  uploadingImage ||
                  emailChecking ||
                  phoneChecking ||
                  !!errors.email ||
                  !!errors.phoneNumber
                }
                className="btn btn-primary px-8"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiSave /> Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
