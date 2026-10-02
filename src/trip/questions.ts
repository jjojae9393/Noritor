export type Mark = 'check' | 'heart'

export type Option = { id: string; label: string; note?: string }

export type Question = {
  id: string
  label: string
  sub?: string
  options: Option[]
  // Questions where several picks naturally go together (e.g. activities)
  multi?: boolean
}

// questionId -> optionId -> mark
export type Answers = Record<string, Record<string, Mark>>

export type MemberRecord = {
  name: string
  answers?: Answers
  etc?: Record<string, string>
  updatedAt: number
}

// questionId -> optionId -> true
export type CandidateTags = Record<string, Record<string, true>>

export type Candidate = {
  name: string
  tags?: CandidateTags
  author: string
  updatedAt: number
}

export const EXPIRE_MS = 3 * 24 * 60 * 60 * 1000

export const MARK_SCORE = { check: 2, heart: 1 } as const

export const ETC_OPTION_ID = 'etc'

const YES_NO: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
]

export const QUESTIONS: Question[] = [
  {
    id: 'dest', label: '여행지',
    options: [
      { id: 'city', label: '도시' },
      { id: 'nature', label: '자연' },
      { id: 'resort', label: '휴양지' },
      { id: ETC_OPTION_ID, label: '기타' },
    ],
  },
  {
    id: 'plan', label: '여행계획',
    options: [
      { id: 'detail', label: '꼼꼼하게', note: '하나부터 열까지' },
      { id: 'rough', label: '대략적인', note: '대충 뭐할지' },
      { id: 'none', label: '계획없이' },
    ],
  },
  {
    id: 'pace', label: '여행강도',
    options: [
      { id: 'packed', label: '알차게' },
      { id: 'relaxed', label: '느긋하게' },
      { id: 'half', label: '반반' },
    ],
  },
  {
    id: 'pack', label: '준비물',
    options: [
      { id: 'all', label: '모두 챙겨' },
      { id: 'light', label: '최대한 가볍게' },
      { id: 'local', label: '대부분 현지에서 구매' },
      { id: 'half', label: '반 챙기고 반은 가서 구매' },
    ],
  },
  {
    id: 'stay', label: '숙소형태',
    options: [
      { id: 'hotel', label: '호텔' },
      { id: 'resort', label: '리조트' },
      { id: 'motel', label: '모텔' },
      { id: 'guest', label: '게스트하우스' },
    ],
  },
  {
    id: 'stayCond', label: '숙소조건', multi: true,
    options: [
      { id: 'cook', label: '취식가능' },
      { id: 'clean', label: '청결' },
      { id: 'private', label: '프라이빗' },
      { id: 'tv', label: 'TV' },
      { id: 'cheap', label: '저렴한 가격' },
      { id: 'location', label: '위치' },
      { id: 'facility', label: '부대시설' },
      { id: ETC_OPTION_ID, label: '기타' },
    ],
  },
  {
    id: 'money', label: '여행경비',
    options: [
      { id: 'each', label: '각자 사용' },
      { id: 'pool', label: '미리 다같이 돈 모아두고 쓰자' },
      { id: 'onePay', label: '한 명이 다 지불&후청구' },
    ],
  },
  {
    id: 'airline', label: '항공사',
    options: [
      { id: 'national', label: '국적기' },
      { id: 'transfer', label: '경유' },
      { id: 'cheapest', label: '최저가' },
    ],
  },
  {
    id: 'transport', label: '교통편',
    options: [
      { id: 'rental', label: '렌터카' },
      { id: 'ownCar', label: '자가차' },
      { id: 'public', label: '버스/지하철' },
      { id: 'walk', label: '뚜벅이' },
    ],
  },
  {
    id: 'sleep', label: '기상/취침',
    options: [
      { id: 'earlyEarly', label: '일찍 자고 일찍 일어남' },
      { id: 'lateLate', label: '늦게 자고 늦게 일어남' },
      { id: 'lateEarly', label: '늦게 자고 일찍 일어남' },
      { id: 'earlyLate', label: '일찍 자고 늦게 일어남' },
    ],
  },
  { id: 'morning', label: '일정', sub: '아침부터 돌아다니자!', options: YES_NO },
  { id: 'night', label: '일정', sub: '밤 늦게까지 돌아다니자!', options: YES_NO },
  {
    id: 'activity', label: '하고 싶은 활동', multi: true,
    options: [
      { id: 'shopping', label: '쇼핑' },
      { id: 'restOut', label: '(실외)휴식' },
      { id: 'restIn', label: '(실내)휴식' },
      { id: 'activity', label: '액티비티' },
      { id: 'food', label: '먹방투어' },
      { id: 'nature', label: '자연탐방' },
      { id: 'fandom', label: '덕질' },
      { id: ETC_OPTION_ID, label: '기타' },
    ],
  },
  {
    id: 'food', label: '선호음식', multi: true,
    options: [
      { id: 'korean', label: '한식' },
      { id: 'local', label: '로컬푸드' },
      { id: 'diet', label: '다이어트 중' },
      { id: ETC_OPTION_ID, label: '기타' },
    ],
  },
  {
    id: 'meal', label: '식사패턴', multi: true,
    options: [
      { id: 'three', label: '삼시세끼 다 먹기' },
      { id: 'two', label: '두 끼만' },
      { id: 'lateSnack', label: '야식' },
      { id: 'slow', label: '천천히 느긋하게 먹기' },
      { id: 'fast', label: '빨리 먹고 다음코스로' },
    ],
  },
  {
    id: 'photo', label: '사진', multi: true,
    options: [
      { id: 'life', label: '인생샷 필수' },
      { id: 'group', label: '단체샷 위주' },
      { id: 'scenery', label: '풍경샷 위주' },
      { id: 'proof', label: '방문 인증샷 위주' },
      { id: 'none', label: '사진 필요없음' },
    ],
  },
]

// Questions that describe a destination itself, used to tag candidates
export const CANDIDATE_QUESTION_IDS = ['dest', 'stay', 'transport', 'airline', 'activity', 'food']

export const CANDIDATE_QUESTIONS = QUESTIONS.filter((q) => CANDIDATE_QUESTION_IDS.includes(q.id))
