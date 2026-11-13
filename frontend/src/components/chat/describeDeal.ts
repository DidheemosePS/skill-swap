import type { SwapRequest } from '../../types'

// Who teaches what and what it's worth, said as an offer while pending and as fact once booked.
// The credit line names only outcomes still possible: once booked, a decline no longer is.
export function describeDeal(request: SwapRequest, myId: string, firstName: string, skillNames: Map<string, string>) {
  const skill = skillNames.get(request.skillId) ?? 'a skill'
  const returnSkill = request.returnSkillId ? (skillNames.get(request.returnSkillId) ?? 'a skill') : null
  const isFree = request.swapType === 'two_way'
  const iTeach = request.teacherId === myId
  const isPending = request.status === 'pending'
  const mine = iTeach ? skill : returnSkill
  const theirs = iTeach ? returnSkill : skill

  const headline = isFree
    ? isPending ? `You'd teach ${mine}, ${firstName} would teach ${theirs}` : `You teach ${mine}, ${firstName} teaches ${theirs}`
    : iTeach
      ? isPending ? `You'd teach ${firstName} ${skill}` : `You teach ${firstName} ${skill}`
      : isPending ? `You'd learn ${skill} from ${firstName}` : `You learn ${skill} from ${firstName}`

  // One short line inside the chat; the tour explains the rules once.
  const creditLine = isFree ? 'Free swap' : iTeach ? 'You earn 1 credit once it happens' : `Uses 1 credit · back if it doesn't happen`

  return { headline, creditLine }
}
