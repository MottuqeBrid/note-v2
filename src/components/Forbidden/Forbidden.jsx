import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

const Forbidden = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 3000); // Redirect to home after 3 seconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-8xl font-black text-primary">403</p>
          <h1 className="mt-4 text-3xl font-bold">Access Denied</h1>
          <p className="mt-2 text-base-content/60">
            You don&apos;t have permission to access this page.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
