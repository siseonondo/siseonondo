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
import { todayEmotions as guestEmotions } from '../data/mockData'

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

// New accounts start empty; seed the same demo emotion records guests see
// so the tab isn't blank on first login. Runs once per user (guarded below).
async function seedEmotions(uid) {
  const now = Date.now()
  await Promise.all(
    guestEmotions.map((e, i) =>
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

export function useEmotions(user) {
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
      if (!user) return
      await addDoc(collection(db, 'users', user.id, 'emotions'), {
        tag,
        situation,
        need,
        intensity,
        area,
        createdAt: serverTimestamp(),
      })
    },
    [user]
  )

  return { emotions, addEmotion, canSave: !!user }
}
