import { fetchSkills } from '../services/skillService'
import { useAsyncData } from './useAsyncData'
import type { AsyncStatus } from './useAsyncData'

export type SkillsStatus = AsyncStatus

export function useSkills() {
  const { data, status, retry } = useAsyncData(fetchSkills)
  return { skills: data ?? [], status, retry }
}
