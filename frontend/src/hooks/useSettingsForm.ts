import { useState } from 'react'
import { saveSettings } from '../services/settingsService'
import type { ConnectedAccount, ProfileSettings } from '../types'
import { slotKey } from '../utils/availability'
import { useToast } from './useToast'

export type SettingsTab = 'profile' | 'skills' | 'availability' | 'account'

export interface SettingsError {
  tab: SettingsTab
  message: string
}

export type SettingsUpdate = ReturnType<typeof useSettingsForm>['update']

export const FIELD_LIMITS = { name: 60, headline: 80, bio: 500 }

// What each tab edits, so a tab can show its own unsaved marker.
const TAB_FIELDS: Record<SettingsTab, (keyof ProfileSettings)[]> = {
  profile: ['name', 'headline', 'bio'],
  skills: ['teachSkills', 'learnSkills'],
  availability: ['availability'],
  account: ['connectedAccounts'],
}

// Toggling an hour off and on again moves it in the list, so slots compare as a sorted set.
const normalize = (settings: ProfileSettings, field: keyof ProfileSettings) =>
  field === 'availability'
    ? settings.availability.slots.map(slotKey).sort().join()
    : JSON.stringify(settings[field])

function validate(draft: ProfileSettings): SettingsError[] {
  const errors: SettingsError[] = []
  if (draft.name.trim() === '') errors.push({ tab: 'profile', message: 'Add your name.' })
  if (draft.teachSkills.length === 0) errors.push({ tab: 'skills', message: 'Add at least one skill you can teach.' })
  if (draft.learnSkills.length === 0) errors.push({ tab: 'skills', message: 'Add at least one skill you want to learn.' })
  if (draft.availability.slots.length === 0) errors.push({ tab: 'availability', message: 'Select at least one hour you are free.' })
  return errors
}

const trimText = (draft: ProfileSettings): ProfileSettings => ({
  ...draft,
  name: draft.name.trim(),
  headline: draft.headline.trim(),
  bio: draft.bio.trim(),
})

// All four tabs edit one draft, so switching tabs never loses an edit and one save covers everything.
export function useSettingsForm(initial: ProfileSettings, onSaved: () => void) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToast()
  // Errors only show once the member tries to save, rather than while they're still typing.
  const [showErrors, setShowErrors] = useState(false)

  const changedTabs = (Object.keys(TAB_FIELDS) as SettingsTab[]).filter((tab) =>
    TAB_FIELDS[tab].some((field) => normalize(draft, field) !== normalize(saved, field)),
  )
  const isDirty = changedTabs.length > 0
  const errors = validate(draft)

  // Takes a function too, for edits that must build on the latest draft, such as a mouse drag
  // across the availability grid that changes several hours between renders.
  function update(patch: Partial<ProfileSettings> | ((current: ProfileSettings) => Partial<ProfileSettings>)) {
    setDraft((current) => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  }

  async function save() {
    setShowErrors(true)
    if (errors.length > 0) return
    setIsSaving(true)
    try {
      const next = await saveSettings(trimText(draft))
      setSaved(next)
      setDraft(next)
      setShowErrors(false)
      onSaved()
      toast.success('Changes saved.')
    } catch {
      toast.error("We couldn't save your changes. They're still here.", save)
    } finally {
      setIsSaving(false)
    }
  }

  function discard() {
    setDraft(saved)
    setShowErrors(false)
  }

  // Connecting or disconnecting saves at once, so both copies take the new list, while any
  // unsaved profile switches the member already flipped are kept in the draft.
  function replaceAccounts(accounts: ConnectedAccount[]) {
    setSaved((current) => ({ ...current, connectedAccounts: accounts }))
    setDraft((current) => ({
      ...current,
      connectedAccounts: accounts.map((account) => ({
        ...account,
        showOnProfile: current.connectedAccounts.find((item) => item.provider === account.provider)?.showOnProfile ?? account.showOnProfile,
      })),
    }))
  }

  return {
    draft,
    changedTabs,
    isDirty,
    errors: showErrors ? errors : [],
    isSaving,
    update,
    save,
    discard,
    replaceAccounts,
  }
}
