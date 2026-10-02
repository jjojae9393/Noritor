import { useState } from 'react'
import { useTripBoard } from '../trip/useTripBoard'
import ChecklistTab from '../trip/ChecklistTab'
import ResultTab from '../trip/ResultTab'
import CandidateTab from '../trip/CandidateTab'
import { getVacationUrl } from '../trip/route'

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

const SHARE_TITLE = '여행 체크리스트✈️'
const COPIED_RESET_MS = 2000

async function shareVacationLink(): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = getVacationUrl()
  if (navigator.share) {
    try {
      await navigator.share({ title: SHARE_TITLE, text: '친구야! 우리 여행 취향 하나씩 맞춰보자', url })
      return 'shared'
    } catch (err) {
      // User closed the share sheet; don't fall through to copying
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    window.prompt('아래 링크를 복사해서 공유하세요', url)
    return 'cancelled'
  }
}

type TripScreenProps = {
  onBackToHub: () => void
}

export default function TripScreen({ onBackToHub }: TripScreenProps) {
  const { members, candidates, loading, error } = useTripBoard()
  const [tab, setTab] = useState<TabId>('checklist')
  const [nickname, setNickname] = useState(loadNickname)
  const [copied, setCopied] = useState(false)

  const handleNicknameChange = (name: string) => {
    setNickname(name)
    storeNickname(name)
  }

  const handleShare = async () => {
    if ((await shareVacationLink()) !== 'copied') return
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_RESET_MS)
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
        <button className="btn btn-ghost btn-sm" onClick={handleShare}>
          {copied ? '링크 복사됨!' : '🔗 링크 공유'}
        </button>
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
