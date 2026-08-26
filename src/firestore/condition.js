import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const DEFAULT_CONDITION = 3

export function useCondition(user) {
  const [guestCondition, setGuestCondition] = useState(DEFAULT_CONDITION)
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
      }
    },
    [user]
  )

  return { condition, setCondition }
}
