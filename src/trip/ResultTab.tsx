import { useMemo } from 'react'
import { QUESTIONS, type MemberRecord } from './questions'
import { getConsensus, type ConsensusLevel } from './recommend'
import { getRemainingLabel } from './useTripBoard'

const LEVEL_LABEL: Record<ConsensusLevel, string> = {
  all: '모두 OK',
  most: '대체로 합의',
  split: '의견 갈림',
  none: '응답 없음',
}

type ResultTabProps = {
  members: [string, MemberRecord][]
}

export default function ResultTab({ members }: ResultTabProps) {
  const records = useMemo(() => members.map(([, m]) => m), [members])
  const results = useMemo(
    () => QUESTIONS.map((q) => ({ question: q, consensus: getConsensus(q, records) })),
    [records],
  )

  if (records.length === 0) {
    return (
      <div className="card">
        <div className="empty-hint">
          아직 작성한 친구가 없어요.<br />체크리스트를 먼저 작성해주세요!
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <div className="card-title">참여한 친구 {records.length}명</div>
        <div className="member-chips">
          {records.map((m) => (
            <span key={m.name} className="member-chip">
              <span className="member-chip-name">
                {m.name}
                <small>{getRemainingLabel(m.updatedAt)}</small>
              </span>
            </span>
          ))}
        </div>
        <div className="hint">가장 많은 친구가 OK(✓·♡)한 선택지를 추천하고, 같으면 ✓가 많은 쪽을 골라요.</div>
      </div>

      <div className="card">
        {results.map(({ question: q, consensus: c }) => (
          <div key={q.id} className="q-row">
            <div className="q-label">
              {q.label}
              {q.sub && <span className="q-sub">{q.sub}</span>}
              <span className={`level-badge ${c.level}`}>{LEVEL_LABEL[c.level]}</span>
            </div>

            {c.picks.length > 0 && (
              <div className="pick-line">
                → {c.picks.map((t) => t.option.label).join(', ')}
              </div>
            )}

            <div className="tally">
              {c.ranked
                .filter((t) => t.checks.length + t.hearts.length > 0)
                .map((t) => (
                  <span key={t.option.id} title={[...t.checks, ...t.hearts.map((n) => `${n}(♡)`)].join(', ')}>
                    {t.option.label}
                    {t.checks.length > 0 && <b className="legend-check"> ✓{t.checks.length}</b>}
                    {t.hearts.length > 0 && <b className="legend-heart"> ♡{t.hearts.length}</b>}
                  </span>
                ))}
            </div>

            {c.leftOut.length > 0 && (
              <div className="left-out">아쉬운 친구: {c.leftOut.join(', ')}</div>
            )}
            {c.etcTexts.length > 0 && (
              <div className="left-out">
                기타: {c.etcTexts.map((e) => `${e.name} "${e.text}"`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
