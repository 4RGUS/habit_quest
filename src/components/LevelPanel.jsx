// src/components/LevelPanel.jsx

const LEVELS = [
  { level:1, title:'Seedling',    emoji:'🌱', min:0,    max:150  },
  { level:2, title:'Sprout',      emoji:'🌿', min:150,  max:400  },
  { level:3, title:'Sapling',     emoji:'🌾', min:400,  max:800  },
  { level:4, title:'Grove',       emoji:'🌳', min:800,  max:1400 },
  { level:5, title:'Forest',      emoji:'🌲', min:1400, max:2200 },
  { level:6, title:'Ancient Oak', emoji:'🏔️', min:2200, max:9999 },
]

export function getLevelInfo(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length-1]
}

export function LevelPanel({ totalXP, streak }) {
  const lvl = getLevelInfo(totalXP)
  const pct = Math.min(100, Math.round(((totalXP - lvl.min) / (lvl.max - lvl.min)) * 100))

  const badges = [
    { label:'3-Day',   icon:'🔥', unlocked: streak >= 3  },
    { label:'7-Day',   icon:'⚡', unlocked: streak >= 7  },
    { label:'21-Day',  icon:'💎', unlocked: streak >= 21 },
    { label:'30-Day',  icon:'👑', unlocked: streak >= 30 },
    { label:'Lvl 3',   icon:'🌿', unlocked: lvl.level >= 3 },
    { label:'Lvl 5',   icon:'🌲', unlocked: lvl.level >= 5 },
    { label:'500 XP',  icon:'⭐', unlocked: totalXP >= 500  },
    { label:'1000 XP', icon:'🏆', unlocked: totalXP >= 1000 },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Level card */}
      <div style={{
        background:'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(167,139,250,0.1))',
        border:'1px solid rgba(99,102,241,0.3)', borderRadius:'var(--radius-xl)', padding:24, textAlign:'center',
      }}>
        <div style={{ fontSize:56, marginBottom:10 }}>{lvl.emoji}</div>
        <div style={{ fontSize:10, letterSpacing:3, color:'var(--text-muted)', textTransform:'uppercase' }}>Level {lvl.level}</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:800, color:'var(--accent-light)', margin:'4px 0 8px' }}>{lvl.title}</div>
        <div style={{ fontSize:13, color:'var(--text-dim)', marginBottom:18 }}>{totalXP.toLocaleString()} total XP</div>
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:10, overflow:'hidden', marginBottom:6 }}>
          <div style={{
            height:'100%', width:`${pct}%`, borderRadius:99,
            background:'linear-gradient(90deg,#6366f1,#a78bfa)',
            transition:'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>{lvl.max - totalXP} XP to next level</div>
      </div>

      {/* Streak */}
      <div style={{
        background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)',
        borderRadius:'var(--radius-lg)', padding:'16px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, color:'rgba(251,191,36,0.7)', textTransform:'uppercase' }}>Current Streak</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'#fbbf24', lineHeight:1.1 }}>🔥 {streak} days</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:'var(--text-dim)' }}>Keep it up!</div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:18 }}>
        <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:14 }}>Badges</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {badges.map(b => (
            <div key={b.label} style={{
              textAlign:'center', padding:'12px 6px', borderRadius:12,
              background: b.unlocked?'rgba(251,191,36,0.08)':'rgba(255,255,255,0.03)',
              border:`1px solid ${b.unlocked?'rgba(251,191,36,0.25)':'var(--border)'}`,
              opacity: b.unlocked ? 1 : 0.35, transition:'all 0.2s',
            }}>
              <div style={{ fontSize:22, marginBottom:4, filter: b.unlocked?'none':'grayscale(1)' }}>{b.icon}</div>
              <div style={{ fontSize:8, color: b.unlocked?'#fbbf24':'var(--text-dim)', letterSpacing:1 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
