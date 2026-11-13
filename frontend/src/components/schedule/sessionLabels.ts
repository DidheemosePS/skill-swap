
interface Deal {
  partnerName: string
  skillName: string
  returnSkillName?: string | null
  isTeaching: boolean
}

// What happens in a session, said from the member's side in the right tense ("You teach Python, Bea teaches
// Spanish" ahead of time, "You taught Dina Python" afterwards), so a row never needs a separate role label.
export function describeDeal({ partnerName, skillName, returnSkillName = null, isTeaching }: Deal, tense: 'ahead' | 'past' | 'called_off' | 'neutral'): string {
  const first = partnerName.split(' ')[0]
  // Until it's settled as having happened, an ended session is named by subject only: "taught" would
  // contradict a no-show report or an outcome nobody has marked yet.
  if (tense === 'neutral') return returnSkillName ? `${skillName} and ${returnSkillName} with ${first}` : `${skillName} with ${first}`
  // A session that never happened says what was planned, so it can't be read as taught.
  if (tense === 'called_off') return isTeaching ? `Was to teach ${first} ${skillName}` : `Was to learn ${skillName} from ${first}`
  if (tense === 'past') {
    const main = isTeaching ? `You taught ${first} ${skillName}` : `${first} taught you ${skillName}`
    return returnSkillName ? `${main}, ${isTeaching ? `${first} taught you` : `you taught ${first}`} ${returnSkillName}` : main
  }
  const main = isTeaching ? `You teach ${skillName}` : `You learn ${skillName}`
  return returnSkillName ? `${main}, ${first} ${isTeaching ? 'teaches' : 'learns'} ${returnSkillName}` : main
}

// A session's name as the swap itself, for cards that show both faces: "Python for Spanish, with Bea",
// "Teaching React to Ivo", "Learning UI Design from Faye".
export function swapTitle({ partnerName, skillName, returnSkillName = null, isTeaching }: Deal): string {
  const first = partnerName.split(' ')[0]
  if (returnSkillName) return isTeaching ? `${skillName} for ${returnSkillName}, with ${first}` : `${returnSkillName} for ${skillName}, with ${first}`
  return isTeaching ? `Teaching ${skillName} to ${first}` : `Learning ${skillName} from ${first}`
}
