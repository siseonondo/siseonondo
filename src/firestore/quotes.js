import { useCallback, useEffect, useState } from 'react'
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, collection } from 'firebase/firestore'
import { db } from '../firebase.js'
import { loadGuestState, saveGuestState } from '../utils/guestStorage.js'

export function useQuotes(user) {
  // 게스트(비로그인) 상태는 이 브라우저의 localStorage에서만 읽고 씁니다 — 서버로 전송되지 않습니다.
  const [guestSaved, setGuestSavedState] = useState(() => loadGuestState().savedQuotes)
  const [remoteSaved, setRemoteSaved] = useState(null)

  useEffect(() => {
    if (!user) {
      setRemoteSaved(null)
      return
    }
    return onSnapshot(collection(db, 'users', user.id, 'savedQuotes'), (snap) => {
      const map = {}
      snap.docs.forEach((d) => {
        map[d.id] = d.data()
      })
      setRemoteSaved(map)
    })
  }, [user])

  const saved = user ? remoteSaved ?? {} : guestSaved

  const setGuestSaved = useCallback((updater) => {
    setGuestSavedState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveGuestState({ savedQuotes: next })
      return next
    })
  }, [])

  const toggleSave = useCallback(
    (quoteId) => {
      const isSaved = !!saved[quoteId]
      if (user) {
        const ref = doc(db, 'users', user.id, 'savedQuotes', quoteId)
        if (isSaved) {
          deleteDoc(ref)
        } else {
          setDoc(ref, { note: '', savedAt: serverTimestamp() })
        }
      } else {
        setGuestSaved((prev) => {
          const next = { ...prev }
          if (isSaved) delete next[quoteId]
          else next[quoteId] = { note: '' }
          return next
        })
      }
    },
    [user, saved, setGuestSaved]
  )

  const updateNote = useCallback(
    (quoteId, note) => {
      if (user) {
        updateDoc(doc(db, 'users', user.id, 'savedQuotes', quoteId), { note })
      } else {
        setGuestSaved((prev) => ({ ...prev, [quoteId]: { ...prev[quoteId], note } }))
      }
    },
    [user, setGuestSaved]
  )

  return { saved, toggleSave, updateNote }
}
