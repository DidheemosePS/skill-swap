import { Link } from 'react-router-dom'
import { FIELD_LIMITS } from '../../hooks/useSettingsForm'
import type { ProfileSettings } from '../../types'
import Avatar from '../common/Avatar'
import TextField from '../common/TextField'

interface ProfileSectionProps {
  draft: ProfileSettings
  profileId: string
  onChange: (patch: Partial<ProfileSettings>) => void
}

export default function ProfileSection({ draft, profileId, onChange }: ProfileSectionProps) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        {/* The photo comes from the connected sign-in account, so there's no upload here. */}
        <Avatar name={draft.name || '?'} url={null} size="lg" />
        <Link to={`/user/${profileId}`} className="rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          View your public profile
        </Link>
      </div>
      <TextField label="Name" value={draft.name} maxLength={FIELD_LIMITS.name} onChange={(name) => onChange({ name })} />
      <TextField
        label="Headline"
        value={draft.headline}
        maxLength={FIELD_LIMITS.headline}
        placeholder="For example: Backend developer learning design"
        onChange={(headline) => onChange({ headline })}
      />
      <TextField
        label="Bio"
        value={draft.bio}
        rows={5}
        maxLength={FIELD_LIMITS.bio}
        placeholder="What you enjoy teaching, and how you like to run a session"
        onChange={(bio) => onChange({ bio })}
      />
    </div>
  )
}
