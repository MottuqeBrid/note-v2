import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import Swal from "sweetalert2";
import { setToken } from "../../lib/localstoreage";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const api = useAxios();

  const onSubmit = async (data) => {
    console.log(import.meta.env.VITE_API_URL);
    try {
      setIsLoading(true);
      const res = await api.post("user", data);
      setToken("token", res.data?.token);
      Swal.fire({
        icon: "success",
        title: "Account created successfully!",
        text: `${res.data?.message}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error creating account!",
        text: `${error?.response?.data?.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "input input-bordered flex items-center gap-2 transition-shadow duration-300 focus-within:shadow-md w-full";
  const inputErrorClass = `${inputClass} input-error`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl animate-[fade-in-up_0.6s_ease-out]">
        <div className="card-body gap-4">
          <h2 className="card-title text-3xl justify-center text-base-content">
            Create Account
          </h2>
          <p className="text-center text-base-content/60 text-sm">
            Sign up to get started
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text">Full Name</span>
              </div>
              <label
                className={`${errors.name ? inputErrorClass : inputClass}`}
              >
                <FiUser className="text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="grow w-full"
                  {...register("name", { required: "Full name is required" })}
                />
              </label>
              {errors.name && (
                <span className="text-error text-xs mt-1">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text">User Name</span>
              </div>
              <label
                className={`${errors.username ? inputErrorClass : inputClass}`}
              >
                <FiUser className="text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="grow w-full"
                  {...register("username", {
                    required: "User name is required",
                  })}
                />
              </label>
              {errors.username && (
                <span className="text-error text-xs mt-1">
                  {errors.username.message}
                </span>
              )}
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text">Email</span>
              </div>
              <label className={errors.email ? inputErrorClass : inputClass}>
                <FiMail className="text-base-content/40 shrink-0" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="grow"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </label>
              {errors.email && (
                <span className="text-error text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text">Password</span>
              </div>
              <label className={errors.password ? inputErrorClass : inputClass}>
                <FiLock className="text-base-content/40 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="grow"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="btn btn-ghost btn-xs"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-base-content/60" />
                  ) : (
                    <FiEye className="text-base-content/60" />
                  )}
                </button>
              </label>
              {errors.password && (
                <span className="text-error text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </label>

            <label className="form-control w-full">
              <div className="label py-1">
                <span className="label-text">Confirm Password</span>
              </div>
              <label
                className={
                  errors.confirmPassword ? inputErrorClass : inputClass
                }
              >
                <FiLock className="text-base-content/40 shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="grow"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      // eslint-disable-next-line react-hooks/incompatible-library
                      val === watch("password") || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((c) => !c)}
                  className="btn btn-ghost btn-xs"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <FiEyeOff className="text-base-content/60" />
                  ) : (
                    <FiEye className="text-base-content/60" />
                  )}
                </button>
              </label>
              {errors.confirmPassword && (
                <span className="text-error text-xs mt-1">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{" "}
            <a href="/login" className="link link-primary">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
