'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const LOBBY_COUNT = 30

const MENU_ITEMS = [
  { label: 'HOME', href: '/', active: true, external: false },
  { label: 'JOIN US', href: 'https://www.tiktok.com/@givydev', active: false, external: true },
]

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="#373F4B"/>
      <rect x="19" y="22" width="26" height="3" fill="#F2F2F2"/>
      <rect x="19" y="30.5" width="26" height="3" fill="#F2F2F2"/>
      <rect x="19" y="39" width="26" height="3" fill="#F2F2F2"/>
    </svg>
  )
}

function BgmIcon({ on }: { on: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="#373F4B"/>
      <path d="M18 26H23L30 20V44L23 38H18V26Z" fill={on ? '#fabf00' : '#F2F2F2'}/>
      {on ? (
        <g className="bgm-wave">
          <path d="M35 24C37.5 26.5 39 29 39 32C39 35 37.5 37.5 35 40" stroke="#fabf00" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M39.5 19C43.5 23 46 27 46 32C46 37 43.5 41 39.5 45" stroke="#fabf00" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        </g>
      ) : (
        <g>
          <path d="M34 25L44 39" stroke="#7a7e85" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M44 25L34 39" stroke="#7a7e85" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      )}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 8 }}>
      <path d="M10.8557 2L12 2L12 3.43273L5.99432 10L4.76607 8.65726L10.8557 2Z" fill="currentColor" />
      <path d="M3.55079 7.32345L-6.30174e-08 3.44167L0 2.00188L1.1298 2.00188L4.77259 5.986L3.55079 7.32345Z" fill="currentColor" />
    </svg>
  )
}

function AngleDivider() {
  return (
    <svg width="100%" height="5" viewBox="0 0 560 5" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', margin: '0 0 24px' }}>
      <path d="M0 4H560" stroke="#fabf00" strokeMiterlimit="10" />
      <path d="M430 0H560V4H420L424.76 1.20615C425.66 0.429117 426.81 0.000859238 430 0Z" fill="#fabf00" />
    </svg>
  )
}

function SectionDivider({ title }: { title: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [lineWidth, setLineWidth] = useState(73)

  useEffect(() => {
    if (textRef.current) {
      setLineWidth(textRef.current.offsetWidth)
    }
  }, [title])

  return (
    <div style={{ marginBottom: 16 }}>
      <p ref={textRef} style={{ fontWeight: 500, fontSize: 13, color: '#fabf00', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'inline-block' }}>{title}</p>
      <svg width={lineWidth} height="4" viewBox="0 0 73 4" preserveAspectRatio="none" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M57.2497 0L53.6572 3.60889H0V0H57.2497Z" fill="#fabf00" />
        <path d="M62.4526 0L58.8601 3.60889H56.8293L60.4218 0H62.4526Z" fill="#fabf00" />
        <path d="M67.6555 0L64.063 3.60889H62.0278L65.6247 0H67.6555Z" fill="#fabf00" />
        <path d="M72.8583 0L69.2614 3.60889H67.2307L70.8276 0H72.8583Z" fill="#fabf00" />
      </svg>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #202227', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
  )
}

export default function Page() {
  const [username, setUsername] = useState('')
  const [lobby, setLobby] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultImg, setResultImg] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bgmOn, setBgmOn] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const sidebarBackdropRef = useRef<HTMLDivElement>(null)
  const bgmAudioRef = useRef<HTMLAudioElement>(null)
  const bgmStartedRef = useRef(false)
  const bgmToggledOnceRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const startBgm = () => {
      if (bgmStartedRef.current) return
      bgmStartedRef.current = true
      const audio = bgmAudioRef.current
      if (!audio) return
      audio.volume = 0.5
      audio.play().then(() => setBgmOn(true)).catch(() => {})
    }
    document.addEventListener('click', startBgm, { capture: true, once: true })
    document.addEventListener('keydown', startBgm, { capture: true, once: true })
    document.addEventListener('touchstart', startBgm, { capture: true, once: true, passive: true })
    return () => {
      document.removeEventListener('click', startBgm, { capture: true } as EventListenerOptions)
      document.removeEventListener('keydown', startBgm, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchstart', startBgm, { capture: true } as EventListenerOptions)
    }
  }, [])

  const toggleBgm = useCallback(() => {
    const audio = bgmAudioRef.current
    if (!audio) return
    if (!bgmToggledOnceRef.current) {
      bgmToggledOnceRef.current = true
      bgmStartedRef.current = true
      audio.muted = false
      audio.volume = 0.5
      audio.play().then(() => setBgmOn(true)).catch(() => {})
      return
    }
    setBgmOn(prev => {
      const next = !prev
      audio.muted = !next
      if (next) audio.play().catch(() => {})
      return next
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!username.trim()) { setError('Masukkan username dulu sebelum generate.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), lobby }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResultImg(data.image)
      setShowResult(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate kartu.')
    } finally {
      setLoading(false)
    }
  }, [username, lobby])

  const handleDownload = useCallback(() => {
    if (!resultImg) return
    const a = document.createElement('a')
    a.href = resultImg
    a.download = `${username || 'card'}-ff-lobby.png`
    a.click()
  }, [resultImg, username])

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) setShowResult(false)
  }, [])

  const handleSidebarBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === sidebarBackdropRef.current) setSidebarOpen(false)
  }, [])

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes bgmWavePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .bgm-toggle { transition: transform 0.15s ease; }
        .bgm-toggle:hover { transform: scale(1.08); }
        .bgm-toggle:active { transform: scale(0.92); }
        .bgm-wave { animation: bgmWavePulse 1.4s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .lobby-tile { transition: none !important; }
          .lobby-tile:hover { transform: none !important; }
          .modal-panel { animation: none !important; }
          .bgm-toggle { transition: none !important; }
          .bgm-toggle:hover, .bgm-toggle:active { transform: none !important; }
          .bgm-wave { animation: none !important; }
        }
        * { -webkit-tap-highlight-color: transparent; }
        .lobby-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .lobby-tile {
          width: 72px; height: 52px; border-radius: 5px; border: 2px solid rgba(153,153,153,0.25);
          background: #363a41; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-family: var(--font-family); font-weight: 500; font-size: 13px; color: #d1d1d1;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden; flex-shrink: 0; position: relative;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .lobby-tile:hover { transform: scale(1.05); }
        .lobby-tile.selected {
          border-color: #fabf00;
          box-shadow: 0 0 10px rgba(250,191,0,0.5);
          color: #fabf00;
        }
        .lobby-tile img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          loading: lazy;
          decoding: async;
        }
        .lobby-tile .num-label {
          position: absolute; bottom: 2px; right: 4px;
          font-size: 10px; font-weight: 700; color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        }
        .random-tile { flex-direction: column; gap: 2px; font-size: 11px; }
        .random-tile svg { width: 22px; height: 22px; }
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 16px; overflow: hidden;
        }
        .modal-panel {
          background: #2c2a2a; border: 1.5px solid #fabf00;
          box-shadow: 0 0 24px rgba(250,191,0,0.25); border-radius: 7px;
          max-width: 480px; width: 100%; padding: 24px;
          animation: fadeIn 0.2s ease; overflow: hidden;
        }
        .btn-gold {
          width: 100%; padding: 14px; background: #fabf00; color: #1a1a1a;
          font-family: var(--font-family); font-weight: 700; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.08em;
          border: none; border-radius: 5px; cursor: pointer;
          transition: background 0.15s ease;
          display: flex; align-items: center; justify-content: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-gold:hover:not(:disabled) { background: #fdda25; }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-outline {
          padding: 10px 20px; background: transparent; color: #d1d1d1;
          font-family: var(--font-family); font-weight: 500; font-size: 14px;
          border: 1.5px solid rgba(153,153,153,0.35); border-radius: 5px;
          cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-outline:hover { border-color: #fabf00; color: #fabf00; }
        .btn-dl {
          padding: 10px 20px; background: #fabf00; color: #1a1a1a;
          font-family: var(--font-family); font-weight: 700; font-size: 14px;
          border: none; border-radius: 5px; cursor: pointer;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .btn-dl:hover { background: #fdda25; }
        .footer-link {
          color: #fabf00; text-decoration: none; font-weight: 500;
        }
        .footer-link:hover { text-decoration: underline; }
        .sidebar-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 200; opacity: 0; pointer-events: none;
          transition: opacity 0.18s ease;
        }
        .sidebar-backdrop.open { opacity: 1; pointer-events: auto; }
        .sidebar-panel {
          position: fixed; top: 0; right: 0; height: 100%;
          width: 260px; max-width: 80vw;
          background: hsla(0,0%,8%,0.98);
          border-left: 1px solid rgba(250,191,0,0.18);
          box-shadow: -4px 0 24px rgba(0,0,0,0.5);
          z-index: 201; transform: translateX(100%);
          transition: transform 0.18s ease;
          display: flex; flex-direction: column;
        }
        .sidebar-panel.open { transform: translateX(0); }
        .sidebar-header {
          display: flex; align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid rgba(153,153,153,0.12);
          height: 52px; flex-shrink: 0; justify-content: flex-end;
        }
        .sidebar-close {
          width: 32px; height: 32px;
          border-radius: 4px; border: none;
          background: transparent; color: #7a7e85; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s ease;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
        }
        .sidebar-close:hover { color: #ffba00; }
        .sidebar-nav { list-style: none; padding: 8px 0; flex: 1; overflow-y: auto; }
        .sidebar-item { position: relative; margin: 0; }
        .sidebar-link {
          display: inline-flex; align-items: center; width: 100%;
          padding: 13px 24px;
          color: #fff; text-decoration: none;
          font-weight: 500; font-size: 1rem; line-height: 1.5rem;
          text-transform: uppercase; white-space: nowrap;
          background: transparent; border: none; position: relative;
          transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          cursor: pointer;
        }
        .sidebar-link::after {
          content: ''; display: none;
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%);
          width: 2px; height: 26px;
          background: #fabf00; border-radius: 2px 0 0 2px;
        }
        .sidebar-link:hover { color: #fdda25; }
        .sidebar-link.active { color: #ffba00; }
        .sidebar-link.active::after { display: block; }
        .sidebar-footer {
          padding: 14px 24px; border-top: 1px solid rgba(153,153,153,0.1);
          font-size: 11px; font-weight: 300; color: #4d5158; flex-shrink: 0;
          letter-spacing: 0.03em;
        }
        .sidebar-link-arrow {
          margin-left: 6px; margin-top: 1px;
          height: 12px; width: 12px;
        }
        @media (prefers-reduced-motion: reduce) {
          .sidebar-panel, .sidebar-backdrop { transition: none !important; }
        }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1a1c20', borderBottom: '1px solid rgba(153,153,153,0.15)', padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#fabf00" opacity="0.15" />
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#fabf00" strokeWidth="1.5" />
            <text x="14" y="18" textAnchor="middle" fill="#fabf00" fontSize="11" fontWeight="700" fontFamily="sans-serif">FF</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: '0.04em', flex: 1 }}>Lobby Card Generator</span>
          <audio ref={bgmAudioRef} src="/1.mp3" loop preload="auto" />
          <button
            type="button"
            onClick={toggleBgm}
            aria-label={bgmOn ? 'Matikan musik latar' : 'Nyalakan musik latar'}
            aria-pressed={bgmOn}
            className="bgm-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <BgmIcon on={bgmOn} />
          </button>
         <button
  type="button"
  onClick={() => setSidebarOpen(true)}
  aria-label="Buka menu"
  aria-expanded={sidebarOpen}
  style={{
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    lineHeight: 0,
  }}
>
  <HamburgerIcon open={sidebarOpen} />
</button>
        </div>
      </header>

      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        ref={sidebarBackdropRef}
        onClick={handleSidebarBackdropClick}
        aria-hidden={!sidebarOpen}
      />
      <aside
        className={`sidebar-panel${sidebarOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="24" fill="#373F4B"/>
  <line x1="23" y1="23" x2="41" y2="41" stroke="#F2F2F2" strokeWidth="3" strokeLinecap="square"/>
  <line x1="41" y1="23" x2="23" y2="41" stroke="#F2F2F2" strokeWidth="3" strokeLinecap="square"/>
</svg>
          </button>
        </div>
        <ul className="sidebar-nav" role="menubar">
          {MENU_ITEMS.map(item => (
            <li className="sidebar-item" key={item.label} role="none">
              <a
                href={item.href}
                className={`sidebar-link${item.active ? ' active' : ''}`}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={() => setSidebarOpen(false)}
                role="menuitem"
              >
                {item.label}
                {item.external && (
                  <svg className="sidebar-link-arrow" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H4.67777V3.7011H8.78536L2 10V13L10.3034 5.22313V9.34158H12V2Z" fill="currentColor"/>
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">FF Lobby Card Generator</div>
      </aside>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px 70px' }}>

        <AngleDivider />

        <section style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-subtle)', borderRadius: 7, padding: '20px 20px 16px', marginBottom: 16 }}>
          <SectionDivider title="Username" />
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.slice(0, 20))}
              maxLength={20}
              placeholder="Nama karakter kamu..."
              style={{
                width: '100%', padding: '11px 48px 11px 14px', background: '#1e2025',
                border: '1.5px solid var(--border-subtle)', borderRadius: 5,
                color: '#fff', fontSize: 15, fontFamily: 'var(--font-family)', fontWeight: 400,
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#fabf00')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,153,153,0.25)')}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 300, color: 'var(--light-text)', opacity: 0.6, pointerEvents: 'none' }}>
              {username.length}/20
            </span>
          </div>
          <p style={{ marginTop: 8, fontSize: 11, fontWeight: 400, color: '#a0a0a0' }}>
            Gunakan huruf biasa, huruf stylish tidak akan muncul di hasil.
          </p>
        </section>

        <AngleDivider />

        <section style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-subtle)', borderRadius: 7, padding: '20px 20px 16px', marginBottom: 16 }}>
          <SectionDivider title="Pilih Lobby" />
          <div className="lobby-grid">
            <button
              className={`lobby-tile random-tile${lobby === 0 ? ' selected' : ''}`}
              onClick={() => setLobby(0)}
              aria-pressed={lobby === 0}
              aria-label="Random lobby"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
              </svg>
              <span>Random</span>
            </button>
            {Array.from({ length: LOBBY_COUNT }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`lobby-tile${lobby === n ? ' selected' : ''}`}
                onClick={() => setLobby(n)}
                aria-pressed={lobby === n}
                aria-label={`Lobby ${n}`}
              >
                <img
                  src={`/lobby/${n}.jpg`}
                  alt={`Lobby ${n}`}
                  loading="lazy"
                  decoding="async"
                  width={72}
                  height={52}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
                />
                <span className="num-label">{n}</span>
              </button>
            ))}
          </div>
        </section>

        <AngleDivider />

        {error && (
          <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 5, padding: '10px 14px', marginBottom: 16, color: 'var(--error-text)', fontSize: 13, fontWeight: 400 }}>
            {error}
          </div>
        )}

        <button className="btn-gold" onClick={handleGenerate} disabled={loading}>
          {loading ? <><Spinner />Generating...</> : 'GENERATE CARD'}
        </button>
      </main>

      {showResult && (
        <div className="modal-backdrop" ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Hasil kartu lobby">
          <div className="modal-panel">
            <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kartu Lobby Kamu</p>
            {resultImg && (
              <img src={resultImg} alt="Generated FF lobby card" style={{ width: '100%', borderRadius: 5, marginBottom: 16, display: 'block' }} />
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setShowResult(false)}>Tutup</button>
              <button className="btn-dl" onClick={handleDownload}>Download</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: '#1a1c20', textAlign: 'center', padding: '16px', borderTop: '1px solid var(--border-subtle)', color: 'var(--light-text)', fontSize: 12, fontWeight: 300 }}>
        <span style={{ fontWeight: 700 }}>FF Lobby Card Generator</span> -{' '}
        <a
          href="https://www.tiktok.com/@givydev"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          @givy
        </a>
      </footer>
    </>
  )
}
