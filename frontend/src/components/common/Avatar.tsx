interface AvatarProps {
  name: string
  url: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { box: 'size-9 text-xs', pixels: 36 },
  md: { box: 'size-12', pixels: 48 },
  lg: { box: 'size-20 text-2xl', pixels: 80 },
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function Avatar({ name, url, size = 'md' }: AvatarProps) {
  const { box, pixels } = SIZES[size]
  if (url) return <img src={url} alt="" width={pixels} height={pixels} className={`${box} rounded-full object-cover`} />
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-strong ${box}`}
    >
      {getInitials(name)}
    </span>
  )
}
