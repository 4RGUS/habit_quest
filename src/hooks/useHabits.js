// src/hooks/useHabits.js
import { useState, useEffect, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import {
  getHabits, createHabit, updateHabit, deleteHabit,
  setCompletion, getRecentCompletions,
  getProfile, updateProfile, todayStr
} from '../lib/db'

// Returns true if a day's completion map has at least one completed habit
function dayHasCompletion(dayData) {
  return Object.values(dayData || {}).some(v => v === true || (typeof v === 'number' && v > 0))
}

// Calculate streak from completion data.
// Walks back day by day; skips today if nothing done yet (user may still complete).
// Stops at the first day with no completions.
function calcStreak(completions) {
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (dayHasCompletion(completions[key])) {
      streak++
    } else if (i === 0) {
      // Today is empty but don't break — user might complete habits later
      continue
    } else {
      break
    }
  }
  return streak
}

export function useHabits(uid) {
  const [habits, setHabits]           = useState([])
  const [completions, setCompletions] = useState({}) // { 'YYYY-MM-DD': { habitId: val } }
  const [profile, setProfile]         = useState({ totalXP: 0, streak: 0, lastDate: '' })
  const [loading, setLoading]         = useState(true)

  // Initial load
  useEffect(() => {
    if (!uid) return
    Promise.all([
      getHabits(uid),
      getRecentCompletions(uid, 60),
      getProfile(uid),
    ]).then(([h, c, p]) => {
      setHabits(h)
      setCompletions(c)

      const streak = calcStreak(c)
      const newProfile = { totalXP: p.totalXP || 0, streak }
      updateProfile(uid, newProfile)
      setProfile(newProfile)
      setLoading(false)
    })
  }, [uid])

  // ── Habit CRUD ───────────────────────────────────────────
  const addHabit = useCallback(async (habit) => {
    const id = await createHabit(uid, habit)
    setHabits(prev => [...prev, { id, ...habit }])
    return id
  }, [uid])

  const editHabit = useCallback(async (id, data) => {
    await updateHabit(uid, id, data)
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...data } : h))
  }, [uid])

  const removeHabit = useCallback(async (id) => {
    await deleteHabit(uid, id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [uid])

  // ── Check off ────────────────────────────────────────────
  const checkHabit = useCallback(async (habitId, value, xpEarned) => {
    const today = todayStr()
    await setCompletion(uid, today, habitId, value)

    const newCompletions = {
      ...completions,
      [today]: { ...(completions[today] || {}), [habitId]: value }
    }
    setCompletions(newCompletions)

    const newXP = Math.max(0, (profile.totalXP || 0) + xpEarned)
    const newStreak = calcStreak(newCompletions)
    await updateProfile(uid, { totalXP: newXP, streak: newStreak })
    setProfile(prev => ({ ...prev, totalXP: newXP, streak: newStreak }))
  }, [uid, profile.totalXP, completions])

  // ── Computed helpers ─────────────────────────────────────
  const todayCompletions = completions[todayStr()] || {}

  const getHabitStreak = useCallback((habitId) => {
    let s = 0
    for (let i = 0; i < 60; i++) {
      const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const val = completions[key]?.[habitId]
      if (val === true || (typeof val === 'number' && val > 0)) s++
      else if (i === 0) continue
      else break
    }
    return s
  }, [completions])

  // days with at least one completion in last N days
  const getCalendarData = useCallback((days = 30) => {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const key = format(d, 'yyyy-MM-dd')
      const dayData = completions[key] || {}
      const total = habits.length
      const done = habits.filter(h => {
        const v = dayData[h.id]
        if (h.type === 'counter') return typeof v === 'number' && v >= (h.target || 1)
        if (h.type === 'multi')   return (h.slots || []).every(s => dayData[`${h.id}_${s}`])
        return !!v
      }).length
      result.push({ date: d, key, done, total })
    }
    return result
  }, [completions, habits])

  return {
    habits, completions, todayCompletions, profile, loading,
    addHabit, editHabit, removeHabit, checkHabit,
    getHabitStreak, getCalendarData,
  }
}
