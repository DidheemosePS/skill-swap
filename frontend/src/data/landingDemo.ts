// Fixtures for the public landing page's "Try a swap" demo and skill ticker.
// Everyone here is fictional: the page labels them as examples, and they must never
// be presented as real members (pre-launch rule in PRODUCT.md). Kept separate from
// mockData.ts so the app's fixtures and the marketing demo can change independently.

export interface DemoPerson {
  name: string
  teaches: string
  wants: string
  // One humanising line shown under a match, e.g. "Patient with absolute beginners".
  line: string
}

// The roster forms a ring (each person wants the previous one's skill), so every
// suggested chip pair can produce either a mutual match or a credit path.
export const DEMO_ROSTER: DemoPerson[] = [
  { name: 'Maya', teaches: 'Spanish', wants: 'Python', line: 'Madrid-born, teaches everyday conversation' },
  { name: 'Cole', teaches: 'Python', wants: 'Japanese', line: 'Backend dev who teaches from real projects' },
  { name: 'Yuki', teaches: 'Japanese', wants: 'UI Design', line: 'Patient with absolute beginners' },
  { name: 'Dara', teaches: 'UI Design', wants: 'Sourdough Baking', line: 'Portfolio reviews and fundamentals' },
  { name: 'Amara', teaches: 'Sourdough Baking', wants: 'Photography', line: 'Starter care to first good loaf' },
  { name: 'Tomas', teaches: 'Photography', wants: 'Public Speaking', line: 'Phone-camera friendly lessons' },
  { name: 'Priya', teaches: 'Public Speaking', wants: 'Guitar', line: 'Coaches nervous first-timers' },
  { name: 'Jonas', teaches: 'Guitar', wants: 'Spanish', line: 'Chords first, theory later' },
]

export const TEACH_SUGGESTIONS = ['Python', 'Spanish', 'Guitar', 'Photography', 'Excel', 'Yoga']
export const LEARN_SUGGESTIONS = ['Spanish', 'Japanese', 'UI Design', 'Public Speaking', 'Sourdough Baking', 'Chess']

// Extra one-line trades so the ticker reads as a varied community, not just the roster.
export const TICKER_TRADES: ReadonlyArray<readonly [name: string, skill: string]> = [
  ...DEMO_ROSTER.map((person) => [person.name, person.teaches] as const),
  ['Nora', 'Chess'],
  ['Leo', 'Excel'],
  ['Sana', 'Yoga'],
  ['Mateo', 'French'],
  ['Ida', 'Knitting'],
  ['Ravi', 'Salsa'],
  ['Elif', 'Watercolour'],
  ['Hugo', 'Interview practice'],
]

export type DemoMatch =
  | { kind: 'mutual'; partner: DemoPerson }
  | { kind: 'credit'; partner: DemoPerson; student: DemoPerson | null }
  | { kind: 'open'; student: DemoPerson | null }

const norm = (skill: string) => skill.trim().toLowerCase()

// Mirrors the product's matching order: a free 2-way swap when one exists, otherwise the
// credit path, and an honest "nobody teaches this yet" result for unknown free-text skills
// (which still names who would pay the visitor to teach, so no input is a dead end).
export function matchDemo(teach: string, learn: string): DemoMatch {
  const mutual = DEMO_ROSTER.find((p) => norm(p.teaches) === norm(learn) && norm(p.wants) === norm(teach))
  if (mutual) return { kind: 'mutual', partner: mutual }

  const student = DEMO_ROSTER.find((p) => norm(p.wants) === norm(teach)) ?? null
  const teacher = DEMO_ROSTER.find((p) => norm(p.teaches) === norm(learn))
  if (teacher) return { kind: 'credit', partner: teacher, student }
  return { kind: 'open', student }
}
