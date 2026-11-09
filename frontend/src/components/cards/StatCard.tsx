interface StatCardProps {
  label: string
  value: string
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg bg-canvas p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  )
}
