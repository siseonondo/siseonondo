import { useCallback, useEffect, useState } from 'react'
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, collection } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useQuotes(user) {
  const [guestSaved, setGuestSaved] = useState({})
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
    [user, saved]
  )

  const updateNote = useCallback(
    (quoteId, note) => {
      if (user) {
        updateDoc(doc(db, 'users', user.id, 'savedQuotes', quoteId), { note })
      } else {
        setGuestSaved((prev) => ({ ...prev, [quoteId]: { ...prev[quoteId], note } }))
      }
    },
    [user]
  )

  return { saved, toggleSave, updateNote }
}
