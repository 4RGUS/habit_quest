// src/components/HabitCard.jsx
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { XPBurst } from './UI'

export function HabitCard({ habit, completion, onCheck, onEdit, onDelete, streak }) {
  const [burst, setBurst] = useState(false)

  const isDone = (() => {
    if (habit.type === 'single') return !!completion[habit.id]
    if (habit.type === 'multi')  return (habit.slots || []).every(s => completion[`${habit.id}_${s}`])
    if (habit.type === 'counter') return (completion[habit.id] || 0) >= (habit.target || 1)
    return false
  })()

  const fire = (id, value, xp) => {
    if (xp > 0) {
      setBurst(true)
      setTimeout(() => setBurst(false), 900)
    }
    onCheck(id, value, xp)
  }

  const color = habit.color || '#6366f1'

  return (
    <div style={{
      background: isDone ? `linear-gradient(135deg, ${color}18, ${color}0a)` : 'var(--bg-card)',
      border: `1px solid ${isDone ? color + '44' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      transition: 'all 0.25s', position: 'relative', overflow: 'visible',
    }}>
      {/* Single */}
      {habit.type === 'single' && (
        <div style={{ display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
          onClick={() => fire(habit.id, !isDone, isDone ? -(habit.xp || 20) : (habit.xp || 20))}>
          <div style={{
            width:48, height:48, borderRadius:14,
            background: isDone ? color : 'rgba(255,255,255,0.07)',
            fontSize:22,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s', flexShrink:0,
          }}>{habit.icon || '✅'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:2 }}>{habit.label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:10, color, letterSpacing:1 }}>+{habit.xp || 20} XP</span>
              {streak > 0 && <span style={{ fontSize:10, color:'#fbbf24', letterSpacing:1 }}>🔥 {streak}d streak</span>}
            </div>
          </div>
          <CheckCircle done={isDone} color={color} />
          {burst && <XPBurst show amount={habit.xp || 20} />}
          <HabitActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}

      {/* Multi (journal-style) */}
      {habit.type === 'multi' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background: isDone?color:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{habit.icon || '📝'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>{habit.label}</div>
              <span style={{ fontSize:10, color, letterSpacing:1 }}>+{Math.round((habit.xp || 20) / (habit.slots || []).length)} XP each</span>
            </div>
            <HabitActions onEdit={onEdit} onDelete={onDelete} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {(habit.slots || []).map(slot => {
              const key = `${habit.id}_${slot}`
              const done = !!completion[key]
              return (
                <div key={slot} onClick={() => { const xpPerSlot = Math.round((habit.xp || 20) / (habit.slots || []).length); fire(key, !done, done ? -xpPerSlot : xpPerSlot) }} style={{
                  flex:1, padding:'10px 4px', borderRadius:12,
                  cursor:'pointer',
                  background: done ? color+'33' : 'rgba(255,255,255,0.05)',
                  border:`1px solid ${done ? color+'55' : 'var(--border)'}`,
                  textAlign:'center', transition:'all 0.2s',
                }}>
                  <div style={{ fontSize:14 }}>{done?'✅':'⬜'}</div>
                  <div style={{ fontSize:9, marginTop:3, color: done?color:'var(--text-dim)', letterSpacing:1 }}>{slot.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
          {burst && <XPBurst show amount={Math.round((habit.xp || 20) / (habit.slots || []).length)} />}
        </div>
      )}

      {/* Counter */}
      {habit.type === 'counter' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background: isDone?color:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{habit.icon || '🔢'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>{habit.label}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, color, letterSpacing:1 }}>+{habit.xp || 5} XP each</span>
                <span style={{ fontSize:10, color:'var(--text-muted)' }}>{completion[habit.id]||0}/{habit.target||8}</span>
              </div>
            </div>
            {(completion[habit.id] || 0) > 0 && (
              <button onClick={() => fire(habit.id, (completion[habit.id]||0)-1, -(habit.xp||5))} style={{
                width:38, height:38, borderRadius:12, border:'none',
                background:'rgba(255,255,255,0.08)',
                color:'#fff', fontSize:20, fontWeight:700, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>−</button>
            )}
            <button onClick={() => !isDone && fire(habit.id, (completion[habit.id]||0)+1, habit.xp||5)} disabled={isDone} style={{
              width:38, height:38, borderRadius:12, border:'none',
              background: isDone?'rgba(255,255,255,0.05)':color,
              color:'#fff', fontSize:20, fontWeight:700, cursor: isDone?'default':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>+</button>
            <HabitActions onEdit={onEdit} onDelete={onDelete} />
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {Array.from({ length: habit.target || 8 }).map((_,i) => (
              <div key={i} style={{
                flex:1, height:5, borderRadius:99,
                background: i<(completion[habit.id]||0)?color:'rgba(255,255,255,0.1)',
                transition:'background 0.3s',
              }} />
            ))}
          </div>
          {burst && <XPBurst show amount={habit.xp || 5} />}
        </div>
      )}
    </div>
  )
}

function CheckCircle({ done, color }) {
  return (
    <div style={{
      width:28, height:28, borderRadius:'50%', flexShrink:0,
      border:`2px solid ${done ? color : 'rgba(255,255,255,0.15)'}`,
      background: done ? color : 'transparent',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {done && <span style={{ color:'#fff', fontSize:13 }}>✓</span>}
    </div>
  )
}

function HabitActions({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:28, height:28, borderRadius:8, border:'1px solid var(--border)',
        background:'transparent', color:'var(--text-muted)', fontSize:16,
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
      }}>⋯</button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:'absolute', top:34, right:0, background:'#1a1635',
          border:'1px solid var(--border-bright)', borderRadius:12,
          overflow:'hidden', zIndex:10, minWidth:120,
        }}>
          <button onClick={onEdit} style={{
            width:'100%', padding:'10px 14px', border:'none', background:'transparent',
            color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:11,
            display:'flex', alignItems:'center', gap:8, cursor:'pointer', textAlign:'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <Pencil size={12} /> Edit
          </button>
          <button onClick={onDelete} style={{
            width:'100%', padding:'10px 14px', border:'none', background:'transparent',
            color:'#f87171', fontFamily:'var(--font-mono)', fontSize:11,
            display:'flex', alignItems:'center', gap:8, cursor:'pointer', textAlign:'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
