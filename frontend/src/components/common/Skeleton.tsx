// One placeholder block. Pulses gently, and holds still for anyone who prefers reduced motion. A className with
// its own rounded-* (avatars are rounded-full) replaces the default corner, since two radius classes would clash.
export default function Skeleton({ className = '' }: { className?: string }) {
  const radius = /\brounded-/.test(className) ? '' : 'rounded-md'
  return <div aria-hidden="true" className={`animate-pulse bg-line motion-reduce:animate-none ${radius} ${className}`} />
}
