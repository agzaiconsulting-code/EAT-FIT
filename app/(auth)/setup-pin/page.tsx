'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PinPad from '@/components/PinPad'

export default function SetupPinPage() {
  const router = useRouter()
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFirstPin(pin: string) {
    setFirstPin(pin)
    setStep('confirm')
    setError('')
  }

  async function handleConfirmPin(pin: string) {
    if (pin !== firstPin) {
      setError('Los PINs no coinciden')
      setStep('enter')
      setFirstPin('')
      return
    }

    setLoading(true)
    const res = await fetch('/api/pin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al guardar PIN')
      setStep('enter')
      setFirstPin('')
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-clay-bg">
      <div
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 flex flex-col items-center gap-6"
        style={{ boxShadow: 'var(--shadow-clay)' }}
      >
        <div className="text-5xl">{step === 'enter' ? '🔑' : '✅'}</div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-clay-text">
            {step === 'enter' ? 'Crea tu PIN' : 'Confirma tu PIN'}
          </h1>
          <p className="text-sm text-clay-gray-dark mt-1">
            {step === 'enter'
              ? 'Elige 4 dígitos que recuerdes fácilmente'
              : 'Repite el PIN para confirmarlo'}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center">
            {error}
          </div>
        )}

        {!loading && (
          <PinPad
            onComplete={step === 'enter' ? handleFirstPin : handleConfirmPin}
            key={step}
          />
        )}

        {loading && <div className="text-2xl animate-spin">⚙️</div>}
      </div>
    </main>
  )
}
