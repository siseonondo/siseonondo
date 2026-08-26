import { useCallback, useEffect, useRef, useState } from 'react'
import { Timestamp, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { initialTasks, bucketForDate, formatDateLabel } from '../data/mockData'

// New accounts start empty; seed the same demo tasks guests see so the
// board isn't blank on first login. Runs once per user (guarded below).
async function seedTasks(uid) {
  const now = Date.now()
  await Promise.all(
    initialTasks.map((t, i) =>
      setDoc(doc(db, 'users', uid, 'tasks', t.id), {
        title: t.title,
        date: t.date,
        bucket: t.bucket,
        dateLabel: t.dateLabel,
        note: t.note,
        done: t.done,
        createdAt: Timestamp.fromMillis(now + i),
      })
    )
  )
}

export function useTasks(user) {
  const [guestTasks, setGuestTasks] = useState(initialTasks)
  const [remoteTasks, setRemoteTasks] = useState(null)
  const seededRef = useRef(false)

  useEffect(() => {
    seededRef.current = false
    if (!user) {
      setRemoteTasks(null)
      return
    }
    const q = query(collection(db, 'users', user.id, 'tasks'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRemoteTasks(list)
      if (list.length === 0 && !seededRef.current) {
        seededRef.current = true
        seedTasks(user.id)
      }
    })
  }, [user])

  const tasks = user ? remoteTasks ?? [] : guestTasks

  const toggleTask = useCallback(
    (id) => {
      if (user) {
        const current = (remoteTasks ?? []).find((t) => t.id === id)
        if (!current) return
        updateDoc(doc(db, 'users', user.id, 'tasks', id), { done: !current.done })
      } else {
        setGuestTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
      }
    },
    [user, remoteTasks]
  )

  const setTaskDate = useCallback(
    (id, dateStr) => {
      const date = dateStr || null
      const patch = { date, bucket: bucketForDate(date), dateLabel: formatDateLabel(date) }
      if (user) {
        updateDoc(doc(db, 'users', user.id, 'tasks', id), patch)
      } else {
        setGuestTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      }
    },
    [user]
  )

  const updateTaskNote = useCallback(
    (id, note) => {
      if (user) {
        updateDoc(doc(db, 'users', user.id, 'tasks', id), { note })
      } else {
        setGuestTasks((prev) => prev.map((t) => (t.id === id ? { ...t, note } : t)))
      }
    },
    [user]
  )

  return { tasks, toggleTask, setTaskDate, updateTaskNote }
}
