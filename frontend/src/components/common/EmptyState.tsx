import type { ReactNode } from 'react'
import StateCard from './StateCard'
import type { StateTone } from './StateCard'
import { EmptyMark } from './stateIcons'
import type { StateIconName } from './stateIcons'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: StateIconName
  tone?: StateTone
  stacked?: boolean
}

// Nothing here yet: an empty seat, a short line and where to go instead.
export default function EmptyState({ title, description, action, icon = 'people', tone = 'card', stacked }: EmptyStateProps) {
  return <StateCard role="status" visual={<EmptyMark icon={icon} />} title={title} description={description} action={action} tone={tone} stacked={stacked} />
}
