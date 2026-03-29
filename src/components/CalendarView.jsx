// src/components/CalendarView.jsx
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarView({ completions, habits }) {
  const [month, setMonth] = useState(new Date())

  const start = startOfMonth(month)
  const end   = endOfMonth(month)
  const days  = eachDayOfInterval({ start, end })

  // Pad start with empty cells
  const startDow = start.getDay() // 0=Sun
  const blanks = Array.from({ length: startDow })

  const getScore = (day) => {
    const key = format(day, 'yyyy-MM-dd')
    const dayData = completions[key] || {}
    if (!habits.length) return 0
    const done = habits.filter(h => {
      const v = dayData[h.id]
      if (h.type === 'counter') return typeof v === 'number' && v >= (h.target || 1)
      if (h.type === 'multi')   return (h.slots || []).every(s => dayData[`${h.id}_${s}`])
      return !!v
    }).length
    return done / habits.length // 0–1
  }

  const scoreColor = (s) => {
    if (s === 0)   return 'rgba(255,255,255,0.05)'
    if (s < 0.34)  return 'rgba(99,102,241,0.25)'
    if (s < 0.67)  return 'rgba(99,102,241,0.55)'
    return '#6366f1'
  }

  const today = new Date()

  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--radius-xl)', padding:20,
    }}>
      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={() => setMonth(m => subMonths(m,1))} style={{
          width:32, height:32, borderRadius:8, border:'1px solid var(--border)',
          background:'transparent', color:'var(--text-muted)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><ChevronLeft size={16}/></button>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>
          {format(month, 'MMMM yyyy')}
        </div>
        <button onClick={() => setMonth(m => addMonths(m,1))} disabled={month >= today} style={{
          width:32, height:32, borderRadius:8, border:'1px solid var(--border)',
          background:'transparent', color: month >= today ? 'var(--text-dim)' : 'var(--text-muted)',
          cursor: month >= today ? 'not-allowed' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><ChevronRight size={16}/></button>
      </div>

      {/* Day labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <div key={i} style={{ textAlign:'center', fontSize:9, color:'var(--text-dim)', letterSpacing:1, padding:'4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {blanks.map((_,i) => <div key={'b'+i} />)}
        {days.map(day => {
          const score = getScore(day)
          const isToday = isSameDay(day, today)
          const isFuture = day > today
          return (
            <div key={day.toString()} title={`${format(day,'MMM d')}: ${Math.round(score*100)}%`} style={{
              aspectRatio:'1', borderRadius:6,
              background: isFuture ? 'transparent' : scoreColor(score),
              border: isToday ? '2px solid #6366f1' : '1px solid transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:9, color: score > 0.5 ? '#fff' : 'var(--text-dim)',
              transition:'background 0.2s',
              cursor:'default',
            }}>
              {format(day,'d')}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:14, justifyContent:'flex-end' }}>
        <span style={{ fontSize:9, color:'var(--text-dim)' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map(s => (
          <div key={s} style={{ width:12, height:12, borderRadius:3, background: s===0 ? 'rgba(255,255,255,0.05)' : scoreColor(s) }} />
        ))}
        <span style={{ fontSize:9, color:'var(--text-dim)' }}>More</span>
      </div>
    </div>
  )
}
