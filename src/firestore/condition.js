import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { loadGuestState, saveGuestState } from '../utils/guestStorage.js'

const DEFAULT_CONDITION = 3

export function useCondition(user) {
  // 게스트(비로그인) 상태는 이 브라우저의 localStorage에서만 읽고 씁니다 — 서버로 전송되지 않습니다.
  const [guestCondition, setGuestCondition] = useState(() => loadGuestState().condition)
  const [remoteCondition, setRemoteCondition] = useState(null)

  useEffect(() => {
    if (!user) {
      setRemoteCondition(null)
      return
    }
    return onSnapshot(doc(db, 'users', user.id), (snap) => {
      setRemoteCondition(snap.data()?.condition ?? DEFAULT_CONDITION)
    })
  }, [user])

  // 게스트는 아직 아무 것도 선택하지 않았으면 null(= 미선택) — 로그인 사용자만 기본값 3으로 시작합니다.
  const condition = user ? remoteCondition ?? DEFAULT_CONDITION : guestCondition

  const setCondition = useCallback(
    (value) => {
      if (user) {
        setDoc(
          doc(db, 'users', user.id),
          { condition: value, conditionUpdatedAt: serverTimestamp() },
          { merge: true }
        )
      } else {
        setGuestCondition(value)
        saveGuestState({ condition: value })
      }
    },
    [user]
  )

  return { condition, setCondition }
}
