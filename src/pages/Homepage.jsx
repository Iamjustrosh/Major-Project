import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'

/* ─── Collaborator data ──────────────────────────────────────── */
const CURSORS = [
  { id: 'alex',   color: '#7c7ce8', label: 'Alex',   initials: 'A' },
  { id: 'maya',   color: '#34d399', label: 'Maya',   initials: 'M' },
  { id: 'jordan', color: '#f59e0b', label: 'Jordan', initials: 'J' },
  { id: 'sam',    color: '#f472b6', label: 'Sam',    initials: 'S' },
  { id: 'lee',    color: '#38bdf8', label: 'Lee',    initials: 'L' },
]

/* ─── macOS-style SVG cursor ─────────────────────────────────── */
function CollabCursor({ color, label }) {
  return (
    <div className="pointer-events-none flex flex-col items-start"
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))' }}>
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={color} stroke="#fff" strokeWidth="1.5"
        style={{ position: 'relative', left: '-6px', top: '-6px' }}>
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.42c.45 0 .67-.54.35-.85L5.5 3.21Z" />
      </svg>
      <div
        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
        style={{ backgroundColor: color, marginTop: '-2px', marginLeft: '10px', whiteSpace: 'nowrap' }}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── Animated whiteboard demo card ─────────────────────────── */
function WhiteboardDemo() {
  const boardRef   = useRef(null)
  const cursorsRef = useRef([])

  /* Animate cursors with GSAP */
  useEffect(() => {
    let ctx
    import('gsap').then(({ gsap }) => {
      if (!boardRef.current) return
      ctx = gsap.context(() => {
        const canvasEl  = boardRef.current.querySelector('.demo-canvas')
        const cardRect  = boardRef.current.getBoundingClientRect()
        const canvasRect = canvasEl
          ? canvasEl.getBoundingClientRect()
          : { width: cardRect.width * 0.94, height: 240, left: 0, top: 0 }

        const offsetX = canvasRect.left - cardRect.left
        const offsetY = canvasRect.top  - cardRect.top
        const cW = canvasRect.width
        const cH = canvasRect.height

        const anchors = [
          { x: cW * 0.08, y: cH * 0.15 },
          { x: cW * 0.55, y: cH * 0.10 },
          { x: cW * 0.28, y: cH * 0.58 },
          { x: cW * 0.70, y: cH * 0.50 },
          { x: cW * 0.16, y: cH * 0.80 },
        ]

        CURSORS.forEach((cursor, i) => {
          const el = cursorsRef.current[i]
          if (!el) return
          const anchor = anchors[i]
          const baseX = offsetX + anchor.x
          const baseY = offsetY + anchor.y

          gsap.set(el, { x: baseX, y: baseY })
          gsap.fromTo(el,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)', delay: i * 0.2 }
          )
          gsap.to(el, {
            x: baseX + gsap.utils.random(-28, 28),
            y: baseY + gsap.utils.random(-16, 16),
            rotation: gsap.utils.random(-4, 4),
            duration: gsap.utils.random(4, 8),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.5,
          })
        })
      }, boardRef)
    }).catch(() => {})

    return () => ctx?.revert()
  }, [])

  /* 3D tilt on hover */
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    let frame
    let tX = 0, tY = 0

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      tX = ((e.clientY - r.top  - r.height / 2) / r.height) * -7
      tY = ((e.clientX - r.left - r.width  / 2) / r.width)  *  9
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      tX = 0; tY = 0
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const apply = () => {
      el.style.transform = `perspective(1100px) rotateX(${tX}deg) rotateY(${tY}deg)`
      frame = null
    }
    el.addEventListener('pointermove',  onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <motion.div
      ref={boardRef}
      className="relative mx-auto w-full max-w-3xl rounded-3xl overflow-hidden"
      style={{
        background:    'rgba(15,17,26,0.85)',
        border:        '1px solid rgba(255,255,255,0.08)',
        boxShadow:     '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(1,143,204,0.10)',
        transformStyle: 'preserve-3d',
        padding:       '1rem 1.25rem 1.5rem',
        backdropFilter: 'blur(12px)',
      }}
      initial={{ opacity: 0, scale: 0.93, y: 30 }}
      animate={{ opacity: 1, scale: 1,    y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/90" />
          <span className="h-3 w-3 rounded-full bg-amber-300/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        </div>
        <span className="text-[11px] font-medium text-white/30"
          style={{ fontFamily: "'Geist Mono', 'Fira Code', monospace" }}>
          collabboard / session / live
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div
          className="demo-canvas relative w-full h-[260px] rounded-2xl overflow-hidden"
          style={{
            background:  '#ffffff',
            border:      '1px solid rgba(0,0,0,0.06)',
            boxShadow:   'inset 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Dot grid */}
          <div className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* SVG diagram sketch */}
          <div className="pointer-events-none absolute inset-0 p-6">
            <svg width="100%" height="100%" viewBox="0 0 520 190"
              preserveAspectRatio="xMidYMid meet" opacity="0.55">
              <defs>
                <marker id="arr" markerWidth="7" markerHeight="7"
                  refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill="#9ca3af"/>
                </marker>
              </defs>

              {/* Boxes */}
              <rect x="16"  y="65" width="88" height="38" rx="8"
                fill="#ede9fe" stroke="#7c7ce8" strokeWidth="1.5"/>
              <text x="60" y="88" textAnchor="middle" fontSize="11"
                fill="#5b5bd6" fontWeight="700" fontFamily="system-ui">Auth</text>

              <rect x="182" y="65" width="88" height="38" rx="8"
                fill="#dcfce7" stroke="#34d399" strokeWidth="1.5"/>
              <text x="226" y="88" textAnchor="middle" fontSize="11"
                fill="#059669" fontWeight="700" fontFamily="system-ui">Whiteboard</text>

              <rect x="348" y="65" width="88" height="38" rx="8"
                fill="#fef9c3" stroke="#f59e0b" strokeWidth="1.5"/>
              <text x="392" y="88" textAnchor="middle" fontSize="11"
                fill="#b45309" fontWeight="700" fontFamily="system-ui">Database</text>

              {/* Arrows */}
              <line x1="104" y1="84" x2="180" y2="84"
                stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="270" y1="84" x2="346" y2="84"
                stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <text x="141" y="78" textAnchor="middle" fontSize="9"
                fill="#9ca3af" fontFamily="system-ui">JWT</text>
              <text x="307" y="78" textAnchor="middle" fontSize="9"
                fill="#9ca3af" fontFamily="system-ui">sync</text>

              {/* Freehand annotation */}
              <path d="M50 148 Q190 128 300 150 Q400 168 470 140"
                stroke="#c4b5fd" strokeWidth="2" fill="none"
                strokeDasharray="5 3" opacity="0.65"/>
              <text x="260" y="172" textAnchor="middle" fontSize="9"
                fill="#a78bfa" fontFamily="system-ui">real-time data flow</text>

              {/* Sticky note */}
              <rect x="410" y="128" width="90" height="44" rx="4"
                fill="#fef08a" stroke="#facc15" strokeWidth="1"/>
              <text x="455" y="147" textAnchor="middle" fontSize="9"
                fill="#854d0e" fontFamily="system-ui">Ship by Friday</text>
              <text x="455" y="160" textAnchor="middle" fontSize="8"
                fill="#a16207" fontFamily="system-ui">— Jordan ✓</text>
            </svg>
          </div>

          {/* Cursors */}
          {CURSORS.map((c, i) => (
            <div
              key={c.id}
              ref={el => { cursorsRef.current[i] = el }}
              className="pointer-events-none absolute top-0 left-0"
              style={{ zIndex: 20 }}
            >
              <CollabCursor color={c.color} label={c.label} />
            </div>
          ))}
        </div>
      </div>

      {/* Presence footer */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {CURSORS.map(c => (
              <div key={c.id}
                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-gray-900"
                style={{ background: c.color + '30', color: c.color }}
                title={c.label}
              >
                {c.initials}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-white/30">
            {CURSORS.length} collaborating now
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Auto-synced
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Feature pills ──────────────────────────────────────────── */
const FEATURES = [
  { dot: 'bg-emerald-400', label: 'Real-time cursors & presence' },
  { dot: 'bg-sky-400',     label: 'Offline-first canvas' },
  { dot: 'bg-violet-400',  label: 'Integrated code editor' },
]

/* ─── Homepage ───────────────────────────────────────────────── */
export default function Homepage() {
  const navigate        = useNavigate()
  const enterGuestMode  = useAuthStore((s) => s.enterGuestMode)

  const handleStart = () => navigate('/login')

  const handleGuest = () => {
    enterGuestMode()
    navigate('/guest')
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center px-5">

      {/* Background glows — matching your original style */}
      <div className="pointer-events-none absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00496E] blur-[120px] opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#00496E] blur-[100px] opacity-50" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6">



        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          COLLAB

          <span
            style={{
              background: 'linear-gradient(135deg, #018FCC 0%, #7c7ce8 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BOARD
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-white/50 max-w-xl leading-relaxed font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          Real-time collaborative whiteboard with an integrated code editor.
          Sketch, code, and ship — together.
        </motion.p>

        {/* Whiteboard demo */}
        <motion.div
          className="w-full mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
        >
          <WhiteboardDemo />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
        >
          {/* Primary */}
          <button
            onClick={handleStart}
            className="relative px-8 py-3 rounded-full text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(1,143,204,0.45)]"
            style={{
              background: 'linear-gradient(135deg, #018FCC, #0178b0)',
              boxShadow: '0 4px 18px rgba(1,143,204,0.35)',
            }}
          >
            Get Started — it's free
          </button>

          {/* Guest — secondary */}
          <button
            onClick={handleGuest}
            className="px-8 py-3 rounded-full text-base font-medium text-white/60 border border-white/15 hover:bg-white/8 hover:text-white/90 hover:border-white/25 transition-all duration-200"
          >
            Continue as Guest
          </button>
        </motion.div>

        {/* Guest hint */}
        <motion.p
          className="text-xs text-white/25 -mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.42 }}
        >
          No account needed for guest · Whiteboard + export only
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-5 text-xs text-white/35 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.46 }}
        >
          {FEATURES.map(({ dot, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
        </motion.div>

      </div>
    </div>
  )
}