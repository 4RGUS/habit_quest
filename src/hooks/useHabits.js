// src/hooks/useHabits.js
import { useState, useEffect, useCallback } from 'react'
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns'
import {
  getHabits, createHabit, updateHabit, deleteHabit,
  getCompletion, setCompletion, getRecentCompletions,
  getProfile, updateProfile, todayStr
} from '../lib/db'

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

      // Streak recalculation on load
      const today = todayStr()
      let { streak, lastDate, totalXP } = p
      if (lastDate !== today) {
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
        if (lastDate === yesterday) {
          streak = (streak || 0) + 1
        } else if (lastDate !== today) {
          streak = 1
        }
        updateProfile(uid, { streak, lastDate: today, totalXP: totalXP || 0 })
        setProfile({ streak, lastDate: today, totalXP: totalXP || 0 })
      } else {
        setProfile(p)
      }
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
    setCompletions(prev => ({
      ...prev,
      [today]: { ...(prev[today] || {}), [habitId]: value }
    }))
    // Award XP (never go below 0)
    const newXP = Math.max(0, (profile.totalXP || 0) + xpEarned)
    await updateProfile(uid, { totalXP: newXP })
    setProfile(prev => ({ ...prev, totalXP: newXP }))
  }, [uid, profile.totalXP])

  // ── Computed helpers ─────────────────────────────────────
  const todayCompletions = completions[todayStr()] || {}

  const getHabitStreak = useCallback((habitId) => {
    let s = 0
    for (let i = 0; i < 365; i++) {
      const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const val = completions[key]?.[habitId]
      if (val === true || (typeof val === 'number' && val > 0)) s++
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
