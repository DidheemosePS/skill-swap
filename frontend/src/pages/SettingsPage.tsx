import { useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import Tabs from '../components/common/Tabs'
import AccountSection from '../components/settings/AccountSection'
import AvailabilitySection from '../components/settings/AvailabilitySection'
import ProfileSection from '../components/settings/ProfileSection'
import SaveBar from '../components/settings/SaveBar'
import SkillsSection from '../components/settings/SkillsSection'
import UnsavedChangesGuard from '../components/settings/UnsavedChangesGuard'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth, useCurrentUser } from '../hooks/useAuth'
import { useSettingsForm } from '../hooks/useSettingsForm'
import type { SettingsTab } from '../hooks/useSettingsForm'
import { fetchSettings } from '../services/settingsService'
import type { ProfileSettings } from '../types'
import { SettingsBodySkeleton } from '../components/common/pageSkeletons'

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: 'Profile',
  skills: 'Skills',
  availability: 'Availability',
  account: 'Account',
}

const TAB_IDS = Object.keys(TAB_LABELS) as SettingsTab[]

function SettingsForm({ initial }: { initial: ProfileSettings }) {
  const { refresh } = useAuth()
  const { id: myId } = useCurrentUser()
  // Reloads the signed-in member after a save, so the navbar shows a new name straight away.
  const form = useSettingsForm(initial, refresh)
  const [searchParams, setSearchParams] = useSearchParams()
  // The tab lives in the URL so a refresh or a shared link opens the same tab.
  const tab = TAB_IDS.find((id) => id === searchParams.get('tab')) ?? 'profile'
  const setTab = (next: SettingsTab) => setSearchParams(next === 'profile' ? {} : { tab: next }, { replace: true })

  const tabs = TAB_IDS.map((id) => ({
    id,
    label: (
      <>
        {TAB_LABELS[id]}
        {/* A dot, plus words for screen readers, marks a section with unsaved edits. */}
        {form.changedTabs.includes(id) && <span role="img" aria-label=", unsaved changes" className="ml-2 inline-block size-1.5 rounded-full bg-held" />}
      </>
    ),
  }))

  return (
    <>
      <Tabs label="Settings sections" tabs={tabs} active={tab} onChange={setTab} vertical>
        {tab === 'profile' && <ProfileSection draft={form.draft} profileId={myId} onChange={form.update} />}
        {tab === 'skills' && <SkillsSection draft={form.draft} onChange={form.update} />}
        {tab === 'availability' && <AvailabilitySection draft={form.draft} onChange={form.update} />}
        {tab === 'account' && (
          <AccountSection
            accounts={form.draft.connectedAccounts}
            isDirty={form.isDirty}
            onToggle={(provider, showOnProfile) => form.update({
              connectedAccounts: form.draft.connectedAccounts.map((item) => (item.provider === provider ? { ...item, showOnProfile } : item)),
            })}
            onAccountsChange={form.replaceAccounts}
          />
        )}
      </Tabs>
      <SaveBar
        isDirty={form.isDirty}
        isSaving={form.isSaving}
        errors={form.errors}
        tabLabels={TAB_LABELS}
        onSave={form.save}
        onDiscard={form.discard}
        onGoToTab={setTab}
      />
      <UnsavedChangesGuard isDirty={form.isDirty} />
    </>
  )
}

export default function SettingsPage() {
  const settings = useAsyncData(fetchSettings)

  return (
    <>
      <title>Settings · Skill Swap</title>
      <AppNavbar />
      {/* Bottom padding keeps the last field clear of the pinned save bar. */}
      <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-page px-4 py-6 pb-40 sm:px-6 sm:py-8 sm:pb-32 lg:px-10">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Settings</h1>
        <div className="mt-6">
          {settings.data === null && settings.status === 'loading' && (
            <div role="status" aria-label="Loading settings"><SettingsBodySkeleton /></div>
          )}
          {settings.status === 'error' && <AlertBanner message="We couldn't load your settings." onRetry={settings.retry} />}
          {/* Mounted once with the loaded values; later saves update the form's own copy. */}
          {settings.data !== null && settings.status !== 'error' && <SettingsForm initial={settings.data} />}
        </div>
      </main>
    </>
  )
}
