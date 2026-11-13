import { mockCurrentUser, mockMatches, mockUsers } from '../data/mockData'
import type { DirectoryMember, ExploreDeal, ExploreFilters, SwapOffer, User, UserSkill } from '../types'
import { MIN_REVIEWS_FOR_RATING } from '../utils/ratings'
import { skillNameKey } from '../utils/skills'
import { hasPendingRequestWith } from './chatService'
import { mockRequest } from './mockClient'
import { getNextSessionAt } from './sessionService'

const sharedSkillIds = (skills: UserSkill[], wanted: UserSkill[]) =>
  skills.filter(({ skill }) => wanted.some((other) => other.skill.id === skill.id)).map(({ skill }) => skill.id)

// Two-way needs both sides to teach something the other wants. Anyone else can still be booked
// with a credit, for any skill they teach, since credits work with any mentor on the platform.
export function getSwapOffer(peer: User): SwapOffer {
  const teachesYou = sharedSkillIds(peer.teachSkills, mockCurrentUser.learnSkills)
  const learnsFromYou = sharedSkillIds(peer.learnSkills, mockCurrentUser.teachSkills)
  if (teachesYou.length > 0 && learnsFromYou.length > 0) {
    return { peer, swapType: 'two_way', teachesYou, learnsFromYou, creditCost: 0 }
  }
  const otherSkills = peer.teachSkills.map(({ skill }) => skill.id).filter((id) => !teachesYou.includes(id))
  return { peer, swapType: 'one_way', teachesYou: [...teachesYou, ...otherSkills], learnsFromYou: [], creditCost: 1 }
}

// The board's sections, decided once per member: a two-way swap is free, and anyone else is learned
// from with a credit, the same rule booking charges by.
const getDeal = (swapType: SwapOffer['swapType']): ExploreDeal => (swapType === 'two_way' ? 'free' : 'credit')

const TYPE_DEALS: Record<ExploreFilters['type'], ExploreDeal | null> = { all: null, '2way': 'free', '1way': 'credit' }

const getScore = (member: User) => mockMatches.find((match) => match.peerId === member.id)?.score ?? 0

const SORTERS: Record<ExploreFilters['sort'], (a: User, b: User) => number> = {
  recommended: (a, b) => getScore(b) - getScore(a) || b.rating - a.rating,
  rated: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  active: (a, b) => Date.parse(b.lastActiveAt) - Date.parse(a.lastActiveAt),
}

// The real backend does this filtering behind GET /users.
export function searchMembers(filters: ExploreFilters): Promise<DirectoryMember[]> {
  const skillKey = skillNameKey(filters.skill)
  const members = mockUsers
    .filter(
      (user) =>
        (!skillKey || user.teachSkills.some(({ skill }) => skillNameKey(skill.name).includes(skillKey))) &&
        // A new member's average isn't shown, so it can't pass a rating filter either.
        (filters.rating === 'any' || (user.reviewCount >= MIN_REVIEWS_FOR_RATING && user.rating >= Number(filters.rating))) &&
        (filters.day === 'any' || user.availability.slots.some((slot) => slot.day === filters.day)) &&
        (!filters.reliable || user.isReliable),
    )
    .sort(SORTERS[filters.sort])
    .map((user) => {
      const swapType = getSwapOffer(user).swapType
      const teachesYou = sharedSkillIds(user.teachSkills, mockCurrentUser.learnSkills)
      const learnsFromYou = sharedSkillIds(user.learnSkills, mockCurrentUser.teachSkills)
      return {
        user,
        swapType,
        deal: getDeal(swapType),
        hasPendingRequest: hasPendingRequestWith(user.id),
        nextSessionAt: getNextSessionAt(user.id),
        teachesYou,
        learnsFromYou,
      }
    })
    .filter(({ deal }) => TYPE_DEALS[filters.type] === null || deal === TYPE_DEALS[filters.type])
  return mockRequest('members', members, [])
}
