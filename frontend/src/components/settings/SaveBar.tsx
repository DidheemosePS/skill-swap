import type { SettingsError, SettingsTab } from '../../hooks/useSettingsForm'
import Button from '../common/Button'

interface SaveBarProps {
  isDirty: boolean
  isSaving: boolean
  errors: SettingsError[]
  tabLabels: Record<SettingsTab, string>
  onSave: () => void
  onDiscard: () => void
  onGoToTab: (tab: SettingsTab) => void
}

// Pinned to the bottom while there's something to save, so the action is never off screen.
export default function SaveBar({ isDirty, isSaving, errors, tabLabels, onSave, onDiscard, onGoToTab }: SaveBarProps) {
  return (
    <div aria-live="polite" className="fixed inset-x-0 bottom-0 z-20 lg:left-(--sidebar-w)">
      {isDirty && (
        <div className="border-t border-line bg-surface shadow-[0_-4px_16px_rgb(0_0_0/0.06)]">
          <div className="mx-auto flex max-w-page flex-col gap-3 px-4 py-3 sm:px-6 sm:flex-row lg:px-10 sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm">
              <p className="font-medium">Unsaved changes</p>
              {errors.length > 0 && (
                <ul role="alert" className="mt-1 space-y-0.5 text-danger">
                  {errors.map((error) => (
                    <li key={error.message}>
                      {error.message}{' '}
                      <button type="button" onClick={() => onGoToTab(error.tab)} className="rounded font-medium underline outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        Go to {tabLabels[error.tab]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={onDiscard} disabled={isSaving} className="flex-1 sm:flex-none">Discard</Button>
              <Button onClick={onSave} isLoading={isSaving} className="flex-1 sm:flex-none">Save changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
