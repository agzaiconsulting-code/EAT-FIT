'use client'

import { useState } from 'react'

interface PinPadProps {
  onComplete: (pin: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function PinPad({ onComplete }: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([])

  function handleKey(key: string) {
    if (key === '⌫') {
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
            className="w-4 h-4 rounded-full transition-all duration-200"
            style={{
              background: digits[i] !== undefined ? '#FFD966' : 'transparent',
              boxShadow:
                digits[i] !== undefined
                  ? '2px 2px 6px #d4c98a, -2px -2px 6px #ffffff'
                  : 'inset 2px 2px 6px #d4c98a, inset -2px -2px 6px #ffffff',
            }}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            disabled={key === ''}
            className={`
              h-16 rounded-2xl text-xl font-semibold text-clay-text
              transition-all duration-100 active:scale-95
              ${key === '' ? 'invisible' : ''}
              ${key === '⌫' ? 'text-clay-gray-dark text-base' : ''}
            `}
            style={
              key !== ''
                ? { background: '#FFFFFF', boxShadow: 'var(--shadow-clay-sm)' }
                : undefined
            }
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
