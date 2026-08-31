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
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-clay-bg">
      <div
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 flex flex-col items-center gap-6"
        style={{ boxShadow: 'var(--shadow-clay)' }}
      >
        <div className="text-6xl select-none">🍉🍔</div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-clay-text">Eat&amp;Fit</h1>
          <p className="text-sm text-clay-gray-dark mt-1">Introduce tu PIN</p>
        </div>

        {error && (
          <p className="text-sm text-red-500">PIN incorrecto, inténtalo de nuevo</p>
        )}

        {loading ? (
          <div className="text-3xl animate-spin py-8">⚙️</div>
        ) : (
          <div className={shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}>
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
      `}</style>
    </main>
  )
}
