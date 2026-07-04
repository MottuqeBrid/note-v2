const faqs = [
  {
    question: "Can I attach files to notes?",
    answer:
      "Yes. You can keep files, images, videos, audio, and other attachments close to your folders and notes.",
  },
  {
    question: "Does M-Note support code snippets?",
    answer:
      "Yes. M-Note supports 40+ languages for code-focused notes and developer references.",
  },
  {
    question: "Are my notes private?",
    answer:
      "Your workspace supports private folders and authenticated access so personal notes stay under your control.",
  },
  {
    question: "Can I use it for free?",
    answer:
      "Yes. The Starter plan is free and includes the core note, file, code, and privacy features.",
  },
];

const FaqSection = () => {
  return (
    <section className="pb-16 pt-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-bold text-neutral md:text-4xl">
          Common questions.
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border border-primary/15 bg-base-100 p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none font-bold text-neutral">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-xl text-primary transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-neutral/60">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
