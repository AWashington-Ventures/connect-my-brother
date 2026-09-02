'use client'
import { useEffect } from 'react'

export default function NotEligiblePage() {
  useEffect(() => {
    // Block back/forward navigation — user stays on this page
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0a1a',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Square and Compass symbol */}
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.6 }}>🏛️</div>

      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#c9a84c',
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}
      >
        For Master Masons Only
      </h1>

      <div
        style={{
          width: '60px',
          height: '2px',
          background: '#c9a84c',
          margin: '0 auto 1.5rem',
          opacity: 0.5,
        }}
      />

      <p
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.05rem',
          color: '#a89060',
          maxWidth: '400px',
          lineHeight: '1.75',
        }}
      >
        This platform is a private network exclusively for verified Master Masons
        of recognized Masonic jurisdictions worldwide.
      </p>
    </main>
  )
}
