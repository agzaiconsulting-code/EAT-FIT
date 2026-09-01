'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PinPad from '@/components/PinPad'

export default function PinPage() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  async function handlePin(pin: string) {
    setLoading(true)
    setError(false)

    const res = await fetch('/api/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/')
      return
    }

    setError(true)
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--c-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--c-text)', margin: 0 }}>
            EAT<span style={{ color: 'var(--c-accent)' }}>&</span>FIT
          </h1>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--c-dim)', marginTop: 8, textTransform: 'uppercase' }}>
            Introduce tu PIN
          </p>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--c-fat)', textAlign: 'center' }}>
            PIN incorrecto, inténtalo de nuevo
          </p>
        )}

        {loading ? (
          <div style={{ padding: '32px 0', color: 'var(--c-dim)', fontSize: 14 }}>Verificando...</div>
        ) : (
          <div
            className={shake ? 'shake' : ''}
            style={{ width: '100%' }}
          >
            <PinPad onComplete={handlePin} key={error ? 'error' : 'ok'} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </main>
  )
}
