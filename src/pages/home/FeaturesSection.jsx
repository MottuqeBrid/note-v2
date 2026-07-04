import { FiCode, FiFileText, FiFolder, FiShield } from "react-icons/fi";

const features = [
  {
    icon: FiFileText,
    title: "Note taking",
    text: "Draft ideas, meeting notes, and study material in a focused writing space.",
  },
  {
    icon: FiFolder,
    title: "File storage",
    text: "Keep related documents, images, audio, and videos attached to your folders.",
  },
  {
    icon: FiCode,
    title: "Code support",
    text: "Save snippets with support for 40+ programming and markup languages.",
  },
  {
    icon: FiShield,
    title: "Secure & private",
    text: "Use private folders and account controls to protect your personal workspace.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Features
        </p>
        <h2 className="mt-2 text-3xl font-bold text-neutral md:text-4xl">
          Everything your notes need to stay useful.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-lg border border-primary/15 bg-base-100 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
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

export default FeaturesSection;
