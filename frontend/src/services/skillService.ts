import { mockSkills } from '../data/mockData'
import type { Skill } from '../types'
import { mockRequest } from './mockClient'

export const fetchSkills = (): Promise<Skill[]> => mockRequest('skills', mockSkills)
