export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-line motion-reduce:animate-none ${className}`} />
}
