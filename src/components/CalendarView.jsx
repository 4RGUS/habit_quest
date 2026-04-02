// src/components/CalendarView.jsx
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isFuture } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function CalendarView({ completions, habits }) {
  const [month, setMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const start = startOfMonth(month)
  const end   = endOfMonth(month)
  const days  = eachDayOfInterval({ start, end })

  const startDow = start.getDay()
  const blanks = Array.from({ length: startDow })

  const getScore = (day) => {
    const key = format(day, 'yyyy-MM-dd')
    const dayData = completions[key] || {}
    if (!habits.length) return 0
    const done = habits.filter(h => habitDone(h, dayData)).length
    return done / habits.length
  }

  const habitDone = (h, dayData) => {
    if (h.type === 'counter') return typeof dayData[h.id] === 'number' && dayData[h.id] >= (h.target || 1)
    if (h.type === 'multi')   return (h.slots || []).every(s => dayData[`${h.id}_${s}`])
    return !!dayData[h.id]
  }

  const scoreColor = (s) => {
    if (s === 0)   return 'rgba(255,255,255,0.05)'
    if (s < 0.34)  return 'rgba(99,102,241,0.25)'
    if (s < 0.67)  return 'rgba(99,102,241,0.55)'
    return '#6366f1'
  }

  const today = new Date()

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedData = selectedKey ? (completions[selectedKey] || {}) : {}

  return (
    <div>
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
            const isDayFuture = isFuture(day) && !isToday
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            return (
              <div
                key={day.toString()}
                onClick={() => !isDayFuture && setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio:'1', borderRadius:6,
                  background: isDayFuture ? 'transparent' : scoreColor(score),
                  border: isSelected ? '2px solid #fff' : isToday ? '2px solid #6366f1' : '1px solid transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, color: score > 0.5 ? '#fff' : 'var(--text-dim)',
                  transition:'all 0.15s',
                  cursor: isDayFuture ? 'default' : 'pointer',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                }}
              >
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

      {/* Day detail panel */}
      {selectedDay && (
        <div style={{
          marginTop:12,
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:20,
          animation:'fadeIn 0.2s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>
              {format(selectedDay, 'EEEE, MMM d')}
            </div>
            <button onClick={() => setSelectedDay(null)} style={{
              width:28, height:28, borderRadius:8, border:'1px solid var(--border)',
              background:'transparent', color:'var(--text-muted)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><X size={14}/></button>
          </div>

          {habits.length === 0 ? (
            <div style={{ color:'var(--text-muted)', fontSize:12, textAlign:'center', padding:'12px 0' }}>No habits tracked yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {habits.map(h => {
                const done = habitDone(h, selectedData)
                const color = h.color || '#6366f1'

                // Build status label per type
                let statusLabel = ''
                if (h.type === 'counter') {
                  const val = selectedData[h.id] || 0
                  statusLabel = `${val} / ${h.target || 1}`
                } else if (h.type === 'multi') {
                  const completedSlots = (h.slots || []).filter(s => selectedData[`${h.id}_${s}`])
                  statusLabel = completedSlots.length === 0
                    ? 'None'
                    : completedSlots.join(', ')
                }

                return (
                  <div key={h.id} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 12px', borderRadius:12,
                    background: done ? `${color}12` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${done ? color + '33' : 'var(--border)'}`,
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background: done ? color : 'rgba(255,255,255,0.07)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                    }}>{h.icon || '🎯'}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>{h.label}</div>
                      {statusLabel && (
                        <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{statusLabel}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize:11, fontWeight:700, letterSpacing:0.5,
                      color: done ? color : 'var(--text-dim)',
                    }}>
                      {done ? '✓ Done' : '✗ Missed'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
