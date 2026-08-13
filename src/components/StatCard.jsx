export default function StatCard({ label, value, accent = false }) {
  return (
    <div className="panel flex flex-col gap-1 px-5 py-4">
      <span className="text-xs uppercase tracking-[0.14em] text-muted">{label}</span>
      <span
        className={`font-mono text-2xl font-medium ${accent ? 'text-brass-bright' : 'text-cream'}`}
      >
        {value}
      </span>
    </div>
  )
}
