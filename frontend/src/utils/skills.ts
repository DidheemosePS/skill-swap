import type { Proficiency, Skill, UserSkill } from '../types'

export const PROFICIENCY_LABELS: Record<Proficiency, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
}

export const MAX_SKILL_NAME_LENGTH = 50

export const cleanSkillName = (name: string) => name.trim().replace(/\s+/g, ' ')

// Compare on this so "react", " React " and "REACT" count as the same skill.
export const skillNameKey = (name: string) => cleanSkillName(name).toLowerCase()

// Rejects input with no letters or digits, such as "!!!", which can't name a skill.
export const isValidSkillName = (name: string) => /[\p{L}\p{N}]/u.test(name)

// The ID comes from the name, so the same custom skill matches across the teach and learn lists.
// Encoding removes spaces, which would break the ID references used by aria-activedescendant.
export function createCustomSkill(name: string): Skill {
  return {
    id: `custom-${encodeURIComponent(skillNameKey(name))}`,
    name: cleanSkillName(name),
    category: 'Custom',
    isCustom: true,
  }
}

export const formatUserSkill = ({ skill, proficiency }: UserSkill) =>
  `${skill.name} · ${PROFICIENCY_LABELS[proficiency]}`
