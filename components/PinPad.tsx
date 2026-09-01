'use client'

import { useState } from 'react'

interface PinPadProps {
  onComplete: (pin: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL']

export default function PinPad({ onComplete }: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([])

  function handleKey(key: string) {
    if (key === 'DEL') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (key === '') return
    if (digits.length >= 4) return

    const next = [...digits, key]
    setDigits(next)

    if (next.length === 4) {
      setTimeout(() => onComplete(next.join('')), 150)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Dots */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              background: digits[i] !== undefined ? 'var(--c-accent)' : 'transparent',
              border: '1.5px solid var(--c-border2)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      {/* Keypad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: '#000',
          width: '100%',
          maxWidth: 260,
        }}
      >
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            disabled={key === ''}
            style={{
              height: 64,
              background: key === 'DEL' ? 'var(--c-bg)' : key === '' ? 'transparent' : 'var(--c-surface)',
              color: key === 'DEL' ? 'var(--c-dim)' : 'var(--c-text)',
              fontSize: key === 'DEL' ? 13 : 20,
              fontWeight: 600,
              border: 'none',
              cursor: key === '' ? 'default' : 'pointer',
              visibility: key === '' ? 'hidden' : 'visible',
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
