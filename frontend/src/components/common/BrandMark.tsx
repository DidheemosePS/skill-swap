// The logo: two circles, one filled and one open, the swap as a mark, beside the name in the display face.
// onDark sets it in white for the noticeboard's ultramarine bar.
export default function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-display text-lg font-semibold tracking-tight ${onDark ? 'text-white' : 'text-ink'}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5"><circle cx="9" cy="12" r="6.5" fill="currentColor" /><circle cx="15" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      Skill Swap
    </span>
  )
}
