const testimonials = [
  {
    quote:
      "M-Note keeps my class notes, references, and code snippets together without feeling heavy.",
    name: "Ari S.",
    role: "Student",
  },
  {
    quote:
      "The folder and file flow is perfect for saving project notes beside the assets I need later.",
    name: "Mina R.",
    role: "Designer",
  },
  {
    quote:
      "I use it as a lightweight developer journal. The language support makes snippets easy to revisit.",
    name: "Tanvir H.",
    role: "Developer",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Testimonials
        </p>
        <h2 className="mt-2 text-3xl font-bold text-neutral md:text-4xl">
          Loved by people who collect ideas daily.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="rounded-lg border border-primary/15 bg-base-100 p-5 shadow-sm"
          >
            <blockquote className="text-sm leading-6 text-neutral/70">
              "{item.quote}"
            </blockquote>
            <figcaption className="mt-5 border-t border-primary/10 pt-4">
              <p className="font-bold text-neutral">{item.name}</p>
              <p className="text-sm text-neutral/50">{item.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
