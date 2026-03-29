// src/lib/db.js
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { format } from 'date-fns'

// ── Habits ──────────────────────────────────────────────────
export const habitsRef  = (uid) => collection(db, 'users', uid, 'habits')
export const habitDoc   = (uid, hid) => doc(db, 'users', uid, 'habits', hid)

export async function getHabits(uid) {
  const q = query(habitsRef(uid), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createHabit(uid, habit) {
  const ref = doc(habitsRef(uid))
  await setDoc(ref, { ...habit, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateHabit(uid, hid, data) {
  await updateDoc(habitDoc(uid, hid), data)
}

export async function deleteHabit(uid, hid) {
  await deleteDoc(habitDoc(uid, hid))
}

// ── Completions ─────────────────────────────────────────────
// path: users/{uid}/completions/{YYYY-MM-DD}
// doc shape: { [habitId]: true | number }

export const completionDoc = (uid, dateStr) =>
  doc(db, 'users', uid, 'completions', dateStr)

export const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export async function getCompletion(uid, dateStr) {
  const snap = await getDoc(completionDoc(uid, dateStr))
  return snap.exists() ? snap.data() : {}
}

export async function setCompletion(uid, dateStr, habitId, value) {
  const ref = completionDoc(uid, dateStr)
  await setDoc(ref, { [habitId]: value }, { merge: true })
}

// Fetch completions for the last N days
export async function getRecentCompletions(uid, days = 30) {
  const result = {}
  const promises = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = format(d, 'yyyy-MM-dd')
    promises.push(
      getCompletion(uid, key).then(data => { result[key] = data })
    )
  }
  await Promise.all(promises)
  return result
}

// ── Streak & XP ─────────────────────────────────────────────
export const profileDoc = (uid) => doc(db, 'users', uid, 'meta', 'profile')

export async function getProfile(uid) {
  const snap = await getDoc(profileDoc(uid))
  return snap.exists() ? snap.data() : { totalXP: 0, streak: 0, lastDate: '' }
}

export async function updateProfile(uid, data) {
  await setDoc(profileDoc(uid), data, { merge: true })
}
