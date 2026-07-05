import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../lib/useAxios";
import { useAuth } from "../../hooks/useAuth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;
const VERIFY_OTP_ENDPOINT = "otp";
const RESEND_OTP_ENDPOINT = "otp?email=";

const onlyDigits = (value) => value.replace(/\D/g, "");

const OtpVerification = () => {
  const api = useAxios();
  const navigate = useNavigate();
  const { state } = useLocation();
  const inputRefs = useRef([]);

  const [email, setEmail] = useState(state?.email || "");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const { user, loading } = useAuth();

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canSubmit = email.trim() && otpValue.length === OTP_LENGTH;

  useEffect(() => {
    if (!loading && user && user.isVerified) {
      navigate("/");
    }
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const updateOtpAt = (index, value) => {
    const nextDigit = onlyDigits(value).slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pastedValue = onlyDigits(event.clipboardData.getData("text")).slice(
      0,
      OTP_LENGTH,
    );

    if (!pastedValue) return;

    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pastedValue.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
    inputRefs.current[Math.min(pastedValue.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      Swal.fire({
        icon: "warning",
        title: "OTP required",
        text: "Enter your email and the 6 digit verification code.",
      });
      return;
    }

    try {
      setVerifying(true);
      const { data } = await api.post(VERIFY_OTP_ENDPOINT, {
        email: email.trim(),
        otp: otpValue,
      });

      Swal.fire({
        icon: "success",
        title: "Email verified",
        text: data?.message || "Your account has been verified successfully.",
        timer: 1600,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text:
          error?.response?.data?.message ||
          "The OTP code is invalid or expired.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Enter your email address before requesting a new OTP.",
      });
      return;
    }

    try {
      setResending(true);
      const { data } = await api.get(RESEND_OTP_ENDPOINT + email.trim(), {
        email: email.trim(),
      });
      setCooldown(RESEND_SECONDS);
      Swal.fire({
        icon: "success",
        title: "OTP sent",
        text: data?.message || "A new verification code was sent.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could not resend OTP",
        text:
          error?.response?.data?.message ||
          "Please check the email address and try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-primary/15 bg-base-100 p-6 shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FiShield className="text-2xl" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Verification
          </p>
          <h1 className="mt-1 text-3xl font-bold text-base-content">
            Enter OTP Code
          </h1>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            We sent a 6 digit code to your email. Enter it below to verify your
            account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <label className="form-control w-full">
            <div className="label py-1">
              <span className="label-text">Email address</span>
            </div>
            <label className="input input-bordered flex w-full items-center gap-2 transition-shadow duration-300 focus-within:shadow-md">
              <FiMail className="shrink-0 text-base-content/40" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="john@example.com"
                className="grow"
                autoComplete="email"
              />
            </label>
          </label>

          <div>
            <div className="label py-1">
              <span className="label-text">Verification code</span>
            </div>
            <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateOtpAt(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(event, index)}
                  className="input input-bordered h-12 w-full rounded-lg p-0 text-center text-lg font-bold tracking-normal focus:input-primary"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || verifying}
            className="btn btn-primary w-full gap-2"
          >
            {verifying ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiCheckCircle />
            )}
            {verifying ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <FiLock className="mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-base-content">
                Did not receive the code?
              </p>
              <p className="mt-1 text-sm text-base-content/60">
                Check your inbox and spam folder, or request a fresh code.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="btn btn-outline btn-primary mt-4 w-full gap-2"
          >
            {resending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiRefreshCw />
            )}
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>

        <Link
          to="/login"
          className="btn btn-ghost mt-4 w-full gap-2 text-base-content/70"
        >
          <FiArrowLeft />
          Back to login
        </Link>
      </div>
    </section>
  );
};

export default OtpVerification;
