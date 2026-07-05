import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiShield,
} from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";
import Swal from "sweetalert2";

const PasswordInput = ({
  label,
  name,
  placeholder,
  register,
  rules,
  errors,
  showToggle,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium flex items-center gap-1">
          <FiLock className="text-primary" /> {label}
        </span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...register(name, rules)}
          className={`input input-bordered w-full pr-10 ${errors[name] ? "input-error" : ""}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
          >
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {errors[name] && (
        <label className="label">
          <span className="label-text-alt text-error flex items-center gap-1">
            <FiAlertCircle /> {errors[name].message}
          </span>
        </label>
      )}
    </div>
  );
};

// ─── Password strength checker ───
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-error" };
  if (score === 2) return { score, label: "Fair", color: "bg-warning" };
  if (score === 3) return { score, label: "Good", color: "bg-info" };
  return { score, label: "Strong", color: "bg-success" };
}

const ChangePassword = () => {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  //   const [newPasswordValue, setNewPasswordValue] = useState("");

  const app = useAxios();
  const navigate = useNavigate();
  const token = getToken("token");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword", "");
  const strength = getPasswordStrength(newPassword);

  const onSubmit = async (data) => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { data: response } = await app.patch(
        `user/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Password changed successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to change password",
        });
      }
      setSuccessMsg("Password changed successfully!");
      reset();
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to change password",
      });
      setErrorMsg(err.response?.data?.message ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-ghost"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-sm text-gray-500">Keep your account secure</p>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-lg p-6 md:p-8">
          {/* Security Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FiShield className="text-3xl text-primary" />
            </div>
          </div>

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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Current Password */}
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              placeholder="Enter current password"
              register={register}
              errors={errors}
              showToggle
              rules={{ required: "Current password is required" }}
            />

            {/* Divider */}
            <div className="divider text-xs text-gray-400">New Password</div>

            {/* New Password */}
            <PasswordInput
              label="New Password"
              name="newPassword"
              placeholder="Enter new password"
              register={register}
              errors={errors}
              showToggle
              rules={{
                required: "New password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
                validate: (val) =>
                  // eslint-disable-next-line react-hooks/incompatible-library
                  val !== watch("currentPassword") ||
                  "New password must be different from current",
              }}
            />

            {/* Password Strength */}
            {newPassword && (
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Password strength</span>
                  <span
                    className={`font-medium ${
                      strength.label === "Weak"
                        ? "text-error"
                        : strength.label === "Fair"
                          ? "text-warning"
                          : strength.label === "Good"
                            ? "text-info"
                            : "text-success"
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        i <= strength.score ? strength.color : "bg-base-300"
                      }`}
                    />
                  ))}
                </div>
                {/* Tips */}
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {[
                    { rule: newPassword.length >= 8, label: "8+ characters" },
                    {
                      rule: /[A-Z]/.test(newPassword),
                      label: "Uppercase letter",
                    },
                    { rule: /[0-9]/.test(newPassword), label: "Number" },
                    {
                      rule: /[^A-Za-z0-9]/.test(newPassword),
                      label: "Special character",
                    },
                  ].map((tip) => (
                    <li
                      key={tip.label}
                      className={`text-xs flex items-center gap-1 ${
                        tip.rule ? "text-success" : "text-gray-400"
                      }`}
                    >
                      {tip.rule ? <FiCheckCircle /> : <FiAlertCircle />}
                      {tip.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              placeholder="Re-enter new password"
              register={register}
              errors={errors}
              showToggle
              rules={{
                required: "Please confirm your password",
                validate: (val) =>
                  val === watch("newPassword") || "Passwords do not match",
              }}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary px-8"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiSave /> Change Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-4 p-4 bg-base-100 rounded-xl shadow text-sm text-gray-500">
          <p className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <FiShield className="text-primary" /> Security Tips
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1">
            <li>Never share your password with anyone</li>
            <li>Use a unique password for this account</li>
            <li>Change your password regularly</li>
            <li>Use a mix of letters, numbers, and symbols</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
