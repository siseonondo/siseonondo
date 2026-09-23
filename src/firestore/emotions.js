import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { todayEmotions as seedEmotionsData } from '../data/mockData'
import { loadGuestState, saveGuestState } from '../utils/guestStorage.js'

const TAG_COLORS = {
  기쁨: 'green',
  안도: 'green',
  평온: 'green',
  불안: 'blue',
  짜증: 'blue',
  무기력: 'blue',
}

function formatTime(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function nowLabel() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// New accounts start empty; seed the same demo emotion records guests see
// so the tab isn't blank on first login. Runs once per user (guarded below).
async function seedEmotions(uid) {
  const now = Date.now()
  await Promise.all(
    seedEmotionsData.map((e, i) =>
      setDoc(doc(db, 'users', uid, 'emotions', e.id), {
        tag: e.tag,
        situation: e.situation,
        need: e.need,
        intensity: e.intensity,
        area: e.area,
        createdAt: Timestamp.fromMillis(now + i),
      })
    )
  )
}

let guestEmotionSeq = 0
function nextGuestEmotionId() {
  guestEmotionSeq += 1
  return `guest-emotion-${Date.now()}-${guestEmotionSeq}`
}

export function useEmotions(user) {
  // 게스트(비로그인) 상태는 이 브라우저의 localStorage에서만 읽고 씁니다 — 서버로 전송되지 않습니다.
  // 처음 방문한 브라우저는 예시 기록 없이 빈 목록으로 시작합니다.
  const [guestEmotions, setGuestEmotionsState] = useState(() => loadGuestState().emotions)
  const [remote, setRemote] = useState(null)
  const seededRef = useRef(false)

  useEffect(() => {
    seededRef.current = false
    if (!user) {
      setRemote(null)
      return
    }
    const q = query(collection(db, 'users', user.id, 'emotions'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          color: TAG_COLORS[data.tag] || 'blue',
          time: formatTime(data.createdAt),
        }
      })
      setRemote(list)
      if (list.length === 0 && !seededRef.current) {
        seededRef.current = true
        seedEmotions(user.id)
      }
    })
  }, [user])

  const emotions = user ? remote ?? [] : guestEmotions

  const addEmotion = useCallback(
    async (tag, situation, need, intensity, area) => {
      if (user) {
        await addDoc(collection(db, 'users', user.id, 'emotions'), {
          tag,
          situation,
          need,
          intensity,
          area,
          createdAt: serverTimestamp(),
        })
      } else {
        const entry = {
          id: nextGuestEmotionId(),
          tag,
          situation,
          need,
          intensity,
          area,
          color: TAG_COLORS[tag] || 'blue',
          time: nowLabel(),
        }
        setGuestEmotionsState((prev) => {
          const next = [...prev, entry]
          saveGuestState({ emotions: next })
          return next
        })
      }
    },
    [user]
  )

  return { emotions, addEmotion, canSave: true }
}
