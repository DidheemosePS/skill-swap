interface AvatarProps {
  name: string
  url: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = {
  xs: { box: 'size-7 text-[0.625rem]', pixels: 28 },
  sm: { box: 'size-9 text-xs', pixels: 36 },
  md: { box: 'size-12 text-sm', pixels: 48 },
  lg: { box: 'size-14 text-base', pixels: 56 },
  xl: { box: 'size-20 text-2xl', pixels: 80 },
}

// Each person keeps one colour everywhere (same name, same hue), so faces are recognised before names are read.
// Mid-tone fills that all hold white initials above 4.5:1.
const HUES = ['bg-[#b8492f]', 'bg-[#2f63ad]', 'bg-[#2f7a50]', 'bg-[#7d4fb0]', 'bg-[#a06614]', 'bg-[#23707a]']
const hueOf = (name: string) => HUES[[...name].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % HUES.length]

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function Avatar({ name, url, size = 'md' }: AvatarProps) {
  const { box, pixels } = SIZES[size]
  if (url) return <img src={url} alt="" width={pixels} height={pixels} className={`${box} shrink-0 rounded-full object-cover`} />
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${hueOf(name)} ${box}`}>
      {getInitials(name)}
    </span>
  )
}
