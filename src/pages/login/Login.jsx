import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const api = useAxios();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // eslint-disable-next-line react-hooks/incompatible-library
  const rememberMe = watch("rememberMe");

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await api.post("user/login", {
        email: data.email,
        password: data.password,
      });
      await login(res.data?.token, rememberMe);
      Swal.fire({
        icon: "success",
        title: "Welcome back!",
        text: res.data?.message,
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: error?.response?.data?.message || "Invalid credentials",
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
            Welcome Back
          </h2>
          <p className="text-center text-base-content/60 text-sm">
            Sign in to your account
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  {...register("rememberMe")}
                />
                <span className="text-sm text-base-content/70">
                  Remember me
                </span>
              </label>
              <a href="#" className="link link-primary text-sm">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
