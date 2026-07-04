const stats = [
  { label: "Total users", value: "2K+" },
  { label: "Notes created", value: "12K+" },
  { label: "Languages supported", value: "40+" },
];

const StatsSection = () => {
  return (
    <section className="py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-primary/15 bg-base-100 p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50"
          >
            <p className="text-4xl font-bold text-primary">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold text-neutral/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
