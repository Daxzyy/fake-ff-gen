'use client'

import { useState, useCallback, useRef } from 'react'

const LOBBY_COUNT = 30

function AngleDivider() {
  return (
    <svg width="100%" height="5" viewBox="0 0 560 5" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', margin: '0 0 24px' }}>
      <path d="M0 4H560" stroke="#fabf00" strokeMiterlimit="10" />
      <path d="M430 0H560V4H420L424.76 1.20615C425.66 0.429117 426.81 0.000859238 430 0Z" fill="#fabf00" />
    </svg>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontWeight: 500, fontSize: 13, color: '#fabf00', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{title}</p>
      <svg width="24" height="4" viewBox="0 0 24 4" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M18.8218 0L17.6407 3.6089H0V0H18.8218Z" fill="#fabf00" />
        <path d="M20.5324 0L19.3513 3.6089H18.6836L19.8647 0H20.5324Z" fill="#fabf00" />
        <path d="M22.2429 0L21.0618 3.6089H20.3927L21.5752 0H22.2429Z" fill="#fabf00" />
        <path d="M23.9534 0L22.7709 3.6089H22.1032L23.2858 0H23.9534Z" fill="#fabf00" />
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
  const [menuOpen, setMenuOpen] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

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

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .lobby-tile { transition: none !important; }
          .lobby-tile:hover { transform: none !important; }
          .modal-panel { animation: none !important; }
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
        .menu-btn {
          width: 36px; height: 36px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px;
          background: transparent; border: none; cursor: pointer;
          margin-left: auto; -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; flex-shrink: 0;
        }
        .menu-btn span {
          display: block; width: 20px; height: 2px; background: #fabf00;
          border-radius: 1px; transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .menu-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .menu-btn.open span:nth-child(2) { opacity: 0; }
        .menu-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .menu-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
          z-index: 90; animation: fadeIn 0.15s ease;
        }
        .menu-panel {
          position: fixed; top: 0; right: 0; bottom: 0; width: 240px;
          max-width: 80vw; background: #1a1c20; border-left: 1.5px solid #fabf00;
          z-index: 95; padding: 16px 0; overflow-y: auto;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          .menu-panel { animation: none !important; }
        }
        .menu-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px 16px; margin-bottom: 8px; border-bottom: 1px solid rgba(153,153,153,0.15);
        }
        .menu-panel-title {
          font-weight: 700; font-size: 13px; color: #fabf00;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .menu-close-btn {
          background: transparent; border: none; color: #d1d1d1; cursor: pointer;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; line-height: 1; -webkit-tap-highlight-color: transparent;
        }
        .menu-close-btn:hover { color: #fabf00; }
        .menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; color: #fff; font-weight: 500; font-size: 14px;
          text-decoration: none; cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left; transition: background 0.15s ease, color 0.15s ease;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
        }
        .menu-item:hover, .menu-item.active { background: rgba(250,191,0,0.1); color: #fabf00; }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1a1c20', borderBottom: '1px solid rgba(153,153,153,0.15)', padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#fabf00" opacity="0.15" />
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#fabf00" strokeWidth="1.5" />
            <text x="14" y="18" textAnchor="middle" fill="#fabf00" fontSize="11" fontWeight="700" fontFamily="sans-serif">FF</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: '0.04em' }}>Lobby Card Generator</span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px 48px' }}>

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
                  src={`/api/img/${n}`}
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

      <footer style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid var(--border-subtle)', color: 'var(--light-text)', fontSize: 12, fontWeight: 300 }}>
        FF Lobby Card Generator -{' '}
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
