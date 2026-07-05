import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import useAxios from "../../lib/useAxios";
import { toast } from "react-toastify";

const Verify = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const app = useAxios();
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.isVerified) {
      navigate("/");
      return;
    }

    // user exist, not verified -> send otp
    const sendOtp = async () => {
      try {
        const { data } = await app.get(`otp?email=${user?.email}`);
        if (data?.success) {
          toast.success("OTP sent to your email. Please check your inbox.");
        } else {
          toast.error("Failed to send OTP");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Failed to send OTP");
      }
    };
    sendOtp();
    navigate("/otp-verification", { state: { email: user?.email } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, navigate, user]);
};

export default Verify;
