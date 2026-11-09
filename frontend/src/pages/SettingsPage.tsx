import { useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import Skeleton from '../components/common/Skeleton'
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

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: 'Public Profile',
  skills: 'Skills & Expertise',
  availability: 'Weekly Availability',
  account: 'Account & Security',
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
        {form.changedTabs.includes(id) && <span aria-label=", unsaved changes" className="ml-1">•</span>}
      </>
    ),
  }))

  return (
    <>
      <Tabs label="Settings sections" tabs={tabs} active={tab} onChange={setTab}>
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
        justSaved={form.justSaved}
        errors={form.errors}
        saveError={form.saveError}
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
      <main className="mx-auto max-w-7xl px-4 py-6 pb-40 sm:py-8 sm:pb-32">
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Settings</h1>
        <div className="mt-6">
          {settings.data === null && settings.status === 'loading' && (
            <div role="status" aria-label="Loading settings" className="space-y-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          )}
          {settings.status === 'error' && <AlertBanner message="We couldn't load your settings." onRetry={settings.retry} />}
          {/* Mounted once with the loaded values; later saves update the form's own copy. */}
          {settings.data !== null && settings.status !== 'error' && <SettingsForm initial={settings.data} />}
        </div>
      </main>
    </>
  )
}
