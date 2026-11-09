import type { ExploreFilters } from '../../types'
import { DAY_OPTIONS, RATING_OPTIONS, SORT_OPTIONS, TYPE_OPTIONS } from '../../utils/exploreFilters'
import { MAX_SKILL_NAME_LENGTH } from '../../utils/skills'
import SelectField from './SelectField'

interface ExploreControlsProps {
  filters: ExploreFilters
  skillInput: string
  onSkillInput: (value: string) => void
  onChange: (changes: Partial<ExploreFilters>) => void
}

export default function ExploreControls({ filters, skillInput, onSkillInput, onChange }: ExploreControlsProps) {
  return (
    <div role="search" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <label className="col-span-2 block text-sm font-medium lg:col-span-1">
        Search by skill
        <input
          type="search"
          value={skillInput}
          maxLength={MAX_SKILL_NAME_LENGTH}
          autoComplete="off"
          placeholder="Try Python, Spanish or Guitar"
          onChange={(event) => onSkillInput(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
        />
      </label>
      <SelectField label="Swap type" value={filters.type} options={TYPE_OPTIONS} onChange={(type) => onChange({ type })} />
      <SelectField label="Minimum rating" value={filters.rating} options={RATING_OPTIONS} onChange={(rating) => onChange({ rating })} />
      <SelectField label="Availability day" value={filters.day} options={DAY_OPTIONS} onChange={(day) => onChange({ day })} />
      <SelectField label="Sort by" value={filters.sort} options={SORT_OPTIONS} onChange={(sort) => onChange({ sort })} />
    </div>
  )
}
