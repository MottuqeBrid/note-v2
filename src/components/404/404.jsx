import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-8xl font-black text-primary">404</p>
          <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
          <p className="mt-2 text-base-content/60">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary mt-8">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;