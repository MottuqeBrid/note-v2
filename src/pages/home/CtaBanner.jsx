import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

const CtaBanner = () => {
  const { user, loading } = useAuth();
  return (
    <section className="py-16">
      <div className="rounded-lg bg-secondary/10 px-6 py-10  md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Ready when you are
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Build your personal knowledge base today.
            </h2>
          </div>
          <Link
            to={`${user && !loading ? "/notes" : "/register"}`}
            className="btn btn-primary shrink-0 gap-2"
          >
            Get Started
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
