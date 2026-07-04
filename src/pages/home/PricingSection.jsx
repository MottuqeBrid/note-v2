import { Link } from "react-router";
import { FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

const benefits = [
  "Unlimited text notes",
  "File and image attachments",
  "Code snippets in 40+ languages",
  "Private folders",
];

const PricingSection = () => {
  const { user, loading } = useAuth();
  return (
    <section className="py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold text-neutral md:text-4xl">
            Start free and keep building your library.
          </h2>
          <p className="mt-4 text-sm leading-6 text-neutral/60">
            The free tier gives you the essentials for personal notes, learning,
            and project organization.
          </p>
        </div>

        <article className="rounded-lg border-2 border-primary bg-base-100 p-6 shadow-lg shadow-primary/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="badge badge-primary mb-3">Free tier</p>
              <h3 className="text-2xl font-bold text-neutral">Starter</h3>
              <p className="mt-1 text-sm text-neutral/60">
                Built for students, developers, and everyday note takers.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-4xl font-bold text-neutral">$0</p>
              <p className="text-sm text-neutral/50">forever</p>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm">
                <FiCheckCircle className="shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>

          <Link
            to={`${user && !loading ? "/notes" : "/register"}`}
            className="btn btn-primary mt-6 w-full"
          >
            Get Started
          </Link>
        </article>
      </div>
    </section>
  );
};

export default PricingSection;
