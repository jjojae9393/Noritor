import { useState } from 'react'
import { useTripBoard } from '../trip/useTripBoard'
import ChecklistTab from '../trip/ChecklistTab'
import ResultTab from '../trip/ResultTab'
import CandidateTab from '../trip/CandidateTab'

const TABS = [
  { id: 'checklist', label: '체크리스트' },
  { id: 'result', label: '결과 보기' },
  { id: 'candidate', label: '후보 비교' },
] as const

type TabId = (typeof TABS)[number]['id']

const NICKNAME_KEY = 'trip_nickname'

function loadNickname() {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function storeNickname(name: string) {
  try {
    localStorage.setItem(NICKNAME_KEY, name)
  } catch {
    // Storage unavailable (private mode); nickname just won't be remembered
  }
}

type TripScreenProps = {
  onBackToHub: () => void
}

export default function TripScreen({ onBackToHub }: TripScreenProps) {
  const { members, candidates, loading, error } = useTripBoard()
  const [tab, setTab] = useState<TabId>('checklist')
  const [nickname, setNickname] = useState(loadNickname)

  const handleNicknameChange = (name: string) => {
    setNickname(name)
    storeNickname(name)
  }

  const renderTab = () => {
    if (loading) {
      return (
        <div className="card">
          <div className="loading">
            <div className="spinner" />
            불러오는 중...
          </div>
        </div>
      )
    }
    if (error) {
      return (
        <div className="card">
          <div className="empty-hint">
            기록을 불러오지 못했어요.<br />잠시 후 다시 시도해주세요.
          </div>
        </div>
      )
    }
    if (tab === 'result') return <ResultTab members={members} />
    if (tab === 'candidate') return <CandidateTab members={members} candidates={candidates} nickname={nickname} />
    return (
      <ChecklistTab
        members={members}
        nickname={nickname}
        onNicknameChange={handleNicknameChange}
        onSaved={() => setTab('result')}
      />
    )
  }

  return (
    <div className="screen">
      <div className="lobby-top">
        <button className="btn btn-ghost btn-sm" onClick={onBackToHub}>← 메뉴 선택</button>
      </div>

      <div className="trip-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`trip-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  )
}
