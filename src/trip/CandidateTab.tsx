import { useMemo, useState } from 'react'
import { CANDIDATE_QUESTIONS, ETC_OPTION_ID, type Candidate, type CandidateTags, type MemberRecord } from './questions'
import { getCandidateFit } from './recommend'
import { addCandidate, removeCandidate, getRemainingLabel } from './useTripBoard'

type CandidateTabProps = {
  members: [string, MemberRecord][]
  candidates: [string, Candidate][]
  nickname: string
}

const toPercent = (ratio: number) => `${Math.round(ratio * 100)}%`

function toggleTag(tags: CandidateTags, qid: string, oid: string): CandidateTags {
  const current = tags[qid] ?? {}
  const { [oid]: wasOn, ...rest } = current
  return { ...tags, [qid]: wasOn ? rest : { ...rest, [oid]: true } }
}

function describeTags(tags: CandidateTags = {}) {
  return CANDIDATE_QUESTIONS.flatMap((q) =>
    q.options.filter((o) => tags[q.id]?.[o.id]).map((o) => o.label),
  ).join(' · ')
}

export default function CandidateTab({ members, candidates, nickname }: CandidateTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [tags, setTags] = useState<CandidateTags>({})
  const [saving, setSaving] = useState(false)

  const tagCount = Object.values(tags).reduce((sum, opts) => sum + Object.keys(opts).length, 0)

  const ranked = useMemo(() => {
    const records = members.map(([, m]) => m)
    return candidates
      .map(([id, c]) => ({ id, candidate: c, fit: getCandidateFit(c, records) }))
      .sort((a, b) => (b.fit.ratio ?? -1) - (a.fit.ratio ?? -1))
  }, [members, candidates])

  const resetForm = () => {
    setName('')
    setTags({})
    setShowForm(false)
  }

  const handleAdd = async () => {
    if (!name.trim() || tagCount === 0 || saving) return
    setSaving(true)
    try {
      await addCandidate(name.trim(), tags, nickname)
      resetForm()
    } catch {
      alert('등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string, candidateName: string) => {
    if (!confirm(`후보 "${candidateName}"을(를) 삭제할까요?`)) return
    await removeCandidate(id)
  }

  return (
    <>
      <div className="card">
        {!showForm ? (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ 후보 여행지 등록</button>
        ) : (
          <>
            <input
              className="input"
              type="text"
              placeholder="여행지 이름 (예: 오사카, 제주)"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="hint">이 여행지에서 가능한 것을 모두 골라주세요.</div>
            {CANDIDATE_QUESTIONS.map((q) => (
              <div key={q.id} className="q-row">
                <div className="q-label">{q.label}</div>
                <div className="opt-list">
                  {q.options.filter((o) => o.id !== ETC_OPTION_ID).map((o) => (
                    <button
                      key={o.id}
                      className={`opt-chip${tags[q.id]?.[o.id] ? ' check' : ''}`}
                      onClick={() => setTags((prev) => toggleTag(prev, q.id, o.id))}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="lobby-top" style={{ marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={resetForm}>취소</button>
              <button className="btn btn-success" onClick={handleAdd} disabled={!name.trim() || tagCount === 0 || saving}>
                {saving ? '등록 중...' : '등록'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">추천 순위</div>
        {ranked.length === 0 ? (
          <div className="empty-hint">
            등록된 후보가 없어요.<br />가고 싶은 여행지를 등록해보세요!
          </div>
        ) : (
          <div className="room-list-wrap">
            {ranked.map(({ id, candidate: c, fit }, i) => (
              <div key={id} className={`cand-item${i === 0 && fit.ratio !== null ? ' best' : ''}`}>
                <div className="cand-head">
                  <span className="cand-rank">{i + 1}</span>
                  <span className="cand-name">{c.name}</span>
                  {i === 0 && fit.ratio !== null && <span className="room-badge ing">추천</span>}
                  <span className="cand-score">{fit.ratio === null ? '-' : toPercent(fit.ratio)}</span>
                  <button className="btn-icon" aria-label={`${c.name} 삭제`} onClick={() => handleRemove(id, c.name)}>×</button>
                </div>
                <div className="fit-bar"><span style={{ width: toPercent(fit.ratio ?? 0) }} /></div>
                <div className="cand-tags">{describeTags(c.tags)}</div>
                {fit.members.length > 0 ? (
                  <div className="tally">
                    {fit.members.map((m) => (
                      <span key={m.name}>{m.name} {toPercent(m.ratio)}</span>
                    ))}
                  </div>
                ) : (
                  <div className="left-out">비교할 체크리스트 응답이 아직 없어요.</div>
                )}
                <div className="cand-meta">
                  {c.author && `${c.author} 등록 · `}{getRemainingLabel(c.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
