import { MARK_SCORE, ETC_OPTION_ID, type Question, type Option, type MemberRecord, type Candidate } from './questions'

export type OptionTally = { option: Option; checks: string[]; hearts: string[] }

export type ConsensusLevel = 'all' | 'most' | 'split' | 'none'

export type Consensus = {
  respondents: string[]
  ranked: OptionTally[]
  picks: OptionTally[]
  level: ConsensusLevel
  // Respondents who marked none of the picks
  leftOut: string[]
  etcTexts: { name: string; text: string }[]
}

export type MemberFit = { name: string; ratio: number }

export type CandidateFit = { ratio: number | null; members: MemberFit[] }

const MAX_MULTI_PICKS = 3

const accepted = (t: OptionTally) => t.checks.length + t.hearts.length

// Prefer the option the most people are OK with; break ties by stronger preference
const compareTally = (a: OptionTally, b: OptionTally) =>
  accepted(b) - accepted(a) || b.checks.length - a.checks.length

const hasAnswered = (m: MemberRecord, questionId: string) =>
  Object.keys(m.answers?.[questionId] ?? {}).length > 0

function getLevel(acceptedCount: number, total: number): ConsensusLevel {
  if (total === 0 || acceptedCount === 0) return 'none'
  if (acceptedCount === total) return 'all'
  return acceptedCount / total >= 0.5 ? 'most' : 'split'
}

export function getConsensus(question: Question, members: MemberRecord[]): Consensus {
  const answered = members.filter((m) => hasAnswered(m, question.id))
  const respondents = answered.map((m) => m.name)

  const tallies: OptionTally[] = question.options.map((option) => ({
    option,
    checks: answered.filter((m) => m.answers?.[question.id]?.[option.id] === 'check').map((m) => m.name),
    hearts: answered.filter((m) => m.answers?.[question.id]?.[option.id] === 'heart').map((m) => m.name),
  }))
  const ranked = [...tallies].sort(compareTally)

  const top = ranked[0]
  const candidates = ranked.filter((t) => accepted(t) > 0)
  const picks = question.multi
    ? candidates.slice(0, MAX_MULTI_PICKS)
    : candidates.filter((t) => compareTally(t, top) === 0)

  const pickedBy = new Set(picks.flatMap((t) => [...t.checks, ...t.hearts]))
  const leftOut = respondents.filter((name) => !pickedBy.has(name))

  const etcTexts = answered
    .filter((m) => m.answers?.[question.id]?.[ETC_OPTION_ID] && m.etc?.[question.id])
    .map((m) => ({ name: m.name, text: m.etc![question.id] }))

  return {
    respondents,
    ranked,
    picks,
    level: getLevel(respondents.length - leftOut.length, respondents.length),
    leftOut,
    etcTexts,
  }
}

function getMemberFit(candidate: Candidate, member: MemberRecord): MemberFit | null {
  const tagged = Object.entries(candidate.tags ?? {}).filter(([qid]) => hasAnswered(member, qid))
  if (tagged.length === 0) return null

  const score = tagged.reduce((sum, [qid, options]) => {
    const marks = Object.keys(options).map((oid) => member.answers?.[qid]?.[oid])
    return sum + Math.max(0, ...marks.map((mark) => (mark ? MARK_SCORE[mark] : 0)))
  }, 0)

  return { name: member.name, ratio: score / (tagged.length * MARK_SCORE.check) }
}

export function getCandidateFit(candidate: Candidate, members: MemberRecord[]): CandidateFit {
  const fits = members
    .map((m) => getMemberFit(candidate, m))
    .filter((f): f is MemberFit => f !== null)
    .sort((a, b) => b.ratio - a.ratio)

  const ratio = fits.length ? fits.reduce((sum, f) => sum + f.ratio, 0) / fits.length : null
  return { ratio, members: fits }
}
