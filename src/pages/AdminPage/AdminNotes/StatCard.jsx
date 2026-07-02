const StatCard = ({ icon, label, value }) => (
  <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
    <div className="mb-2 text-primary">{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-neutral/60">{label}</p>
  </div>
);

export default StatCard;
