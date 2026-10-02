import { useState } from 'react'
import { QUESTIONS, ETC_OPTION_ID, type Answers, type Mark, type MemberRecord } from './questions'
import { saveMember, removeMember, getRemainingLabel } from './useTripBoard'

const NEXT_MARK: Record<'none' | Mark, Mark | null> = { none: 'check', check: 'heart', heart: null }

const MARK_ICON = { check: '✓', heart: '♡' } as const

type ChecklistTabProps = {
  members: [string, MemberRecord][]
  nickname: string
  onNicknameChange: (name: string) => void
  onSaved: () => void
}

function cycleMark(answers: Answers, qid: string, oid: string): Answers {
  const current = answers[qid] ?? {}
  const next = NEXT_MARK[current[oid] ?? 'none']
  const { [oid]: _removed, ...rest } = current
  return { ...answers, [qid]: next ? { ...rest, [oid]: next } : rest }
}

// Drop "기타" text for questions where 기타 is no longer marked
const pickActiveEtc = (answers: Answers, etc: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(etc).filter(([qid, text]) => answers[qid]?.[ETC_OPTION_ID] && text.trim()),
  )

export default function ChecklistTab({ members, nickname, onNicknameChange, onSaved }: ChecklistTabProps) {
  const [nameInput, setNameInput] = useState(nickname)
  const [activeName, setActiveName] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [etc, setEtc] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const answeredCount = QUESTIONS.filter((q) => Object.keys(answers[q.id] ?? {}).length > 0).length
  const isExisting = members.some(([, m]) => m.name === activeName)

  const startWith = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const found = members.find(([, m]) => m.name === trimmed)?.[1]
    setAnswers(found?.answers ?? {})
    setEtc(found?.etc ?? {})
    setActiveName(trimmed)
    onNicknameChange(trimmed)
  }

  const handleSave = async () => {
    if (!activeName || saving) return
    setSaving(true)
    try {
      await saveMember(activeName, answers, pickActiveEtc(answers, etc))
      onSaved()
    } catch {
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (key: string, name: string) => {
    if (!confirm(`${name}님의 기록을 삭제할까요?`)) return
    await removeMember(key)
  }

  if (!activeName) {
    return (
      <>
        <div className="card">
          <div className="card-title">내 이름</div>
          <div className="field-group">
            <input
              className="input"
              type="text"
              placeholder="닉네임"
              maxLength={12}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && startWith(nameInput)}
            />
            <button className="btn btn-success btn-sm" onClick={() => startWith(nameInput)} disabled={!nameInput.trim()}>
              시작
            </button>
          </div>
          <div className="hint">같은 이름으로 다시 들어오면 기존 기록을 수정할 수 있어요.</div>
        </div>

        {members.length > 0 && (
          <div className="card">
            <div className="card-title">작성한 친구 · 눌러서 수정</div>
            <div className="member-chips">
              {members.map(([key, m]) => (
                <span key={key} className="member-chip">
                  <button className="member-chip-name" onClick={() => startWith(m.name)}>
                    {m.name}
                    <small>{getRemainingLabel(m.updatedAt)}</small>
                  </button>
                  <button className="member-chip-del" aria-label={`${m.name} 삭제`} onClick={() => handleRemove(key, m.name)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="card title-bar">
        <div className="title-bar-name">{activeName}님의 체크리스트</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setActiveName(null)}>이름 변경</button>
      </div>

      <div className="card">
        <div className="trip-legend">
          탭할 때마다 바뀌어요 · <span className="legend-check">✓ 좋아요</span> → <span className="legend-heart">♡ 상관없어요</span> → 해제
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.id} className="q-row">
            <div className="q-label">
              {q.label}
              {q.sub && <span className="q-sub">{q.sub}</span>}
            </div>
            <div className="opt-list">
              {q.options.map((o) => {
                const mark = answers[q.id]?.[o.id]
                return (
                  <button
                    key={o.id}
                    className={`opt-chip${mark ? ` ${mark}` : ''}`}
                    onClick={() => setAnswers((prev) => cycleMark(prev, q.id, o.id))}
                  >
                    {mark && <span className="opt-mark">{MARK_ICON[mark]}</span>}
                    {o.label}
                    {o.note && <span className="opt-note">{o.note}</span>}
                  </button>
                )
              })}
            </div>
            {answers[q.id]?.[ETC_OPTION_ID] && (
              <input
                className="input etc-input"
                type="text"
                placeholder="기타 내용"
                maxLength={30}
                value={etc[q.id] ?? ''}
                onChange={(e) => setEtc((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="hint" style={{ marginTop: 0, marginBottom: 10, textAlign: 'center' }}>
          {answeredCount}/{QUESTIONS.length}개 응답 · 저장 후 3일이 지나면 자동 삭제돼요
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || answeredCount === 0}>
          {saving ? '저장 중...' : isExisting ? '수정 저장' : '저장하기'}
        </button>
      </div>
    </>
  )
}
