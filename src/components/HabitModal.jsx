// src/components/HabitModal.jsx
import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from './UI'

const ICONS = ['📖','💻','✍️','💧','🧘','🏃','🎸','🎨','💪','🥗','😴','📚','🧹','💰','🌱','🎯','🙏','📝','🎮','🌿']
const COLORS = ['#6366f1','#10b981','#f59e0b','#38bdf8','#a78bfa','#f472b6','#fb923c','#34d399','#e879f9','#facc15']

const TYPE_OPTIONS = [
  { value:'single',  label:'Single check-off (do once)' },
  { value:'counter', label:'Counter (e.g. glasses of water)' },
  { value:'multi',   label:'Multi-slot (e.g. morning / evening)' },
]

const DEFAULT = { label:'', icon:'🎯', color:'#6366f1', type:'single', xp:20, target:8, slots:['Morning','Evening'] }

export function HabitModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(DEFAULT)
  const [slotInput, setSlotInput] = useState('')

  useEffect(() => {
    if (initial) setForm({ ...DEFAULT, ...initial })
    else setForm(DEFAULT)
  }, [initial, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSlot = () => {
    const s = slotInput.trim()
    if (s && !(form.slots||[]).includes(s)) {
      set('slots', [...(form.slots||[]), s])
      setSlotInput('')
    }
  }

  const removeSlot = (s) => set('slots', (form.slots||[]).filter(x => x !== s))

  const handleSave = () => {
    if (!form.label.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Habit' : '➕ New Habit'}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        <Input label="Habit Name" value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Read 20 pages" />

        {/* Icon picker */}
        <div>
          <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Icon</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)} style={{
                width:36, height:36, borderRadius:10, border:`2px solid ${form.icon===ic?'#6366f1':'var(--border)'}`,
                background: form.icon===ic?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                fontSize:18, cursor:'pointer', transition:'all 0.15s',
              }}>{ic}</button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Color</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)} style={{
                width:26, height:26, borderRadius:'50%', background:c, border:`3px solid ${form.color===c?'#fff':'transparent'}`,
                cursor:'pointer', transition:'all 0.15s',
              }} />
            ))}
          </div>
        </div>

        <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTIONS} />

        {form.type === 'counter' && (
          <Input label="Daily Target" type="number" value={form.target} onChange={e => set('target', e.target.value === '' ? '' : (parseInt(e.target.value)||1))} onBlur={() => { if (form.target === '' || form.target < 1) set('target', 1) }} />
        )}

        {form.type === 'multi' && (
          <div>
            <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:8 }}>Slots</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {(form.slots||[]).map(s => (
                <span key={s} style={{
                  fontSize:11, padding:'4px 10px', borderRadius:99,
                  background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
                  color:'#a5b4fc', display:'flex', alignItems:'center', gap:6,
                }}>
                  {s}
                  <span onClick={() => removeSlot(s)} style={{ cursor:'pointer', opacity:0.6 }}>×</span>
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={slotInput} onChange={e => setSlotInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && addSlot()}
                placeholder="Add slot (e.g. Afternoon)"
                style={{
                  flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)', padding:'8px 12px',
                  color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none',
                }} />
              <Button size="sm" onClick={addSlot}>Add</Button>
            </div>
          </div>
        )}

        <Input label="XP Reward" type="number" value={form.xp} onChange={e => set('xp', e.target.value === '' ? '' : (parseInt(e.target.value)||1))} onBlur={() => { if (form.xp === '' || form.xp < 1) set('xp', 1) }} />

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <Button variant="ghost" onClick={onClose} style={{ flex:1 }}>Cancel</Button>
          <Button onClick={handleSave} style={{ flex:2 }} disabled={!form.label.trim()}>Save Habit</Button>
        </div>
      </div>
    </Modal>
  )
}
