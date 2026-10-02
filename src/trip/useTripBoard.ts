import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { ref, onValue, update, set, push, remove, serverTimestamp } from 'firebase/database'
import { EXPIRE_MS, type Answers, type MemberRecord, type Candidate, type CandidateTags } from './questions'

const BOARD_PATH = 'trip'

// Firebase keys cannot contain . # $ [ ] /
export const toMemberKey = (name: string) => name.replace(/[.#$[\]/]/g, '_')

export function getRemainingLabel(updatedAt: number) {
  const left = updatedAt + EXPIRE_MS - Date.now()
  const hours = Math.max(1, Math.ceil(left / (60 * 60 * 1000)))
  return hours >= 24 ? `${Math.floor(hours / 24)}일 남음` : `${hours}시간 남음`
}

function splitExpired<T extends { updatedAt: number }>(data: Record<string, T>, cutoff: number) {
  const alive: [string, T][] = []
  const expired: string[] = []
  Object.entries(data).forEach(([key, item]) => {
    if (item.updatedAt > cutoff) alive.push([key, item])
    else expired.push(key)
  })
  return { alive: alive.sort((a, b) => a[1].updatedAt - b[1].updatedAt), expired }
}

export function useTripBoard() {
  const [members, setMembers] = useState<[string, MemberRecord][]>([])
  const [candidates, setCandidates] = useState<[string, Candidate][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    return onValue(ref(db, BOARD_PATH), (snap) => {
      const data = snap.val() || {}
      const cutoff = Date.now() - EXPIRE_MS
      const m = splitExpired<MemberRecord>(data.members || {}, cutoff)
      const c = splitExpired<Candidate>(data.candidates || {}, cutoff)

      // No server-side TTL on RTDB, so whoever opens the board sweeps expired records
      const expiredPaths = [
        ...m.expired.map((k) => `members/${k}`),
        ...c.expired.map((k) => `candidates/${k}`),
      ]
      if (expiredPaths.length) {
        update(ref(db, BOARD_PATH), Object.fromEntries(expiredPaths.map((p) => [p, null])))
      }

      setMembers(m.alive)
      setCandidates(c.alive)
      setError(false)
      setLoading(false)
    }, () => {
      setError(true)
      setLoading(false)
    })
  }, [])

  return { members, candidates, loading, error }
}

export function saveMember(name: string, answers: Answers, etc: Record<string, string>) {
  return set(ref(db, `${BOARD_PATH}/members/${toMemberKey(name)}`), {
    name,
    answers,
    etc,
    updatedAt: serverTimestamp(),
  })
}

export function removeMember(key: string) {
  return remove(ref(db, `${BOARD_PATH}/members/${key}`))
}

export function addCandidate(name: string, tags: CandidateTags, author: string) {
  return set(push(ref(db, `${BOARD_PATH}/candidates`)), {
    name,
    tags,
    author,
    updatedAt: serverTimestamp(),
  })
}

export function removeCandidate(id: string) {
  return remove(ref(db, `${BOARD_PATH}/candidates/${id}`))
}
