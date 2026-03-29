// src/pages/Dashboard.jsx
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useHabits } from '../hooks/useHabits'
import { HabitCard } from '../components/HabitCard'
import { HabitModal } from '../components/HabitModal'
import { CalendarView } from '../components/CalendarView'
import { LevelPanel } from '../components/LevelPanel'
import { PageLoader, Button, Modal } from '../components/UI'
import { Plus, LogOut, LayoutGrid, CalendarDays, Trophy } from 'lucide-react'
import { todayStr } from '../lib/db'

const TABS = [
  { id:'today',    label:'Today',   Icon: LayoutGrid   },
  { id:'history',  label:'History', Icon: CalendarDays },
  { id:'level',    label:'Level',   Icon: Trophy       },
]

export default function Dashboard() {
  const { user } = useAuth()
  const {
    habits, completions, todayCompletions, profile, loading,
    addHabit, editHabit, removeHabit, checkHabit, getHabitStreak,
  } = useHabits(user?.uid)

  const [tab,        setTab]        = useState('today')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)

  if (loading) return <PageLoader />

  const totalHabits = habits.length
  const doneToday = habits.filter(h => {
    const c = todayCompletions
    if (h.type === 'single')  return !!c[h.id]
    if (h.type === 'multi')   return (h.slots||[]).every(s => c[`${h.id}_${s}`])
    if (h.type === 'counter') return (c[h.id]||0) >= (h.target||1)
    return false
  }).length
  const pct = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0

  const handleSaveHabit = async (form) => {
    if (editTarget) {
      await editHabit(editTarget.id, form)
      setEditTarget(null)
    } else {
      await addHabit(form)
    }
  }

  const handleCheck = (habitId, value, xp) => {
    checkHabit(habitId, value, xp)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative', overflow:'hidden' }}>
      {/* Ambient bg */}
      <div style={{ position:'fixed', top:-120, left:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', pointerEvents:'none', animation:'orb 10s ease-in-out infinite' }} />
      <div style={{ position:'fixed', bottom:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', pointerEvents:'none', animation:'orb 14s ease-in-out infinite reverse' }} />

      <div style={{ maxWidth:640, margin:'0 auto', padding:'0 16px 100px' }}>
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'28px 0 20px' }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:'var(--text-muted)', textTransform:'uppercase' }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',month:'short',day:'numeric'})}
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, lineHeight:1.1 }}>
              {pct === 100 ? '🎉 Crushed it!' : 'Daily Quest'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ textAlign:'right', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:12, padding:'7px 13px' }}>
              <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:2 }}>STREAK</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'#fbbf24' }}>🔥 {profile.streak}</div>
            </div>
            <button onClick={() => signOut(auth)} style={{
              width:36, height:36, borderRadius:10, border:'1px solid var(--border)',
              background:'transparent', color:'var(--text-muted)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><LogOut size={15}/></button>
          </div>
        </div>

        {/* Progress bar */}
        {tab === 'today' && totalHabits > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:1 }}>{doneToday}/{totalHabits} DONE</span>
              <span style={{ fontSize:10, color: pct===100?'var(--green)':'var(--text-muted)', fontWeight:700 }}>{pct}%</span>
            </div>
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:7, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${pct}%`, borderRadius:99,
                background: pct===100 ? 'linear-gradient(90deg,#10b981,#6ee7b7)' : 'linear-gradient(90deg,#6366f1,#a78bfa,#f59e0b)',
                backgroundSize:'200%', animation:'shimmer 2s linear infinite',
                transition:'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20, background:'rgba(255,255,255,0.03)', padding:5, borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer',
              fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase',
              background: tab===id ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: tab===id ? 'var(--accent-light)' : 'var(--text-muted)',
              borderBottom: tab===id ? '2px solid #6366f1' : '2px solid transparent',
              transition:'all 0.2s',
            }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {tab === 'today' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'fadeIn 0.3s ease' }}>
            {habits.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:8 }}>No habits yet</div>
                <div style={{ fontSize:12, marginBottom:24 }}>Add your first habit to start your quest</div>
                <Button onClick={() => setModalOpen(true)}><Plus size={14}/> Add Habit</Button>
              </div>
            ) : (
              habits.map(h => (
                <HabitCard
                  key={h.id} habit={h}
                  completion={todayCompletions}
                  streak={getHabitStreak(h.id)}
                  onCheck={handleCheck}
                  onEdit={() => { setEditTarget(h); setModalOpen(true) }}
                  onDelete={() => setDeleteId(h.id)}
                />
              ))
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <CalendarView completions={completions} habits={habits} />
          </div>
        )}

        {/* LEVEL TAB */}
        {tab === 'level' && (
          <div style={{ animation:'fadeIn 0.3s ease' }}>
            <LevelPanel totalXP={profile.totalXP||0} streak={profile.streak||0} />
          </div>
        )}
      </div>

      {/* FAB */}
      {tab === 'today' && (
        <button onClick={() => { setEditTarget(null); setModalOpen(true) }} style={{
          position:'fixed', bottom:28, right:24,
          width:56, height:56, borderRadius:'50%', border:'none',
          background:'linear-gradient(135deg,#6366f1,#a78bfa)',
          color:'#fff', fontSize:26, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 8px 32px rgba(99,102,241,0.4)',
          transition:'transform 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >+</button>
      )}

      {/* Habit modal */}
      <HabitModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSave={handleSaveHabit}
        initial={editTarget}
      />

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Habit?">
        <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
          This will remove the habit and all its completion history. This can't be undone.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)} style={{ flex:1 }}>Cancel</Button>
          <Button variant="danger" onClick={() => { removeHabit(deleteId); setDeleteId(null) }} style={{ flex:1 }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
