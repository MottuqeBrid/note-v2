import { FiEdit3, FiLogIn, FiMonitor } from "react-icons/fi";

const steps = [
  {
    icon: FiLogIn,
    title: "Sign up",
    text: "Create your account and open a personal workspace in seconds.",
  },
  {
    icon: FiEdit3,
    title: "Create note",
    text: "Write notes, attach files, and organize everything into folders.",
  },
  {
    icon: FiMonitor,
    title: "Access anywhere",
    text: "Return to your notes from any browser whenever you need them.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="border-y border-primary/10 bg-primary/5 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          How it works
        </p>
        <h2 className="mt-2 text-3xl font-bold text-neutral md:text-4xl">
          From idea to organized workspace.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <article
            key={title}
            className="relative rounded-lg border border-primary/15 bg-base-100 p-6 shadow-sm"
          >
            <span className="absolute right-5 top-5 text-4xl font-bold text-primary/15">
              0{index + 1}
            </span>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-content">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral/60">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
