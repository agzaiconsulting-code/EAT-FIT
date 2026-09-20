'use client'

import { DayRecord } from '@/lib/dayColor'

interface DayCellProps {
  fecha: string
  record?: DayRecord | null
  onClick: () => void
  isToday: boolean
  isFuture: boolean
}

type DayVariant = 'fit' | 'fat' | 'gold' | 'mixed' | 'empty'

function getDayVariant(record: DayRecord | null | undefined): DayVariant {
  if (!record) return 'empty'
  const fit = record.comida === 'fit'
  const sport = record.gimnasio
  const alcohol = (record.cervezas ?? 0) > 0

  if (!record.comida && !sport && !alcohol) return 'empty'
  if (fit && sport && !alcohol) return 'fit'
  if (fit && sport && alcohol) return 'gold'
  if (!fit && !sport && alcohol) return 'fat'
  return 'mixed'
}

const VARIANT_STYLES: Record<DayVariant, { bg: string; color: string; glow: string }> = {
  fit:   { bg: 'rgba(52,211,153,0.2)',   color: '#34D399', glow: '0 0 14px rgba(52,211,153,0.3)' },
  fat:   { bg: 'rgba(248,113,113,0.2)',  color: '#F87171', glow: '0 0 12px rgba(248,113,113,0.25)' },
  gold:  { bg: 'rgba(252,211,77,0.2)',   color: '#FCD34D', glow: '0 0 14px rgba(252,211,77,0.3)' },
  mixed: { bg: 'rgba(167,139,250,0.15)', color: '#C4B5FD', glow: '0 0 12px rgba(167,139,250,0.2)' },
  empty: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', glow: 'none' },
}

export default function DayCell({ fecha, record, onClick, isToday, isFuture }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const variant = getDayVariant(record)
  const { bg, color, glow } = VARIANT_STYLES[variant]

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: isFuture ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        width: '100%',
        aspectRatio: '1',
      }}
    >
      <div
        style={{
          width: '84%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: isFuture ? 'transparent' : bg,
          boxShadow: isFuture ? 'none' : glow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: isToday ? '2px solid var(--c-accent)' : 'none',
          outlineOffset: 2,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isFuture ? 'rgba(255,255,255,0.15)' : color,
            lineHeight: 1,
          }}
        >
          {day}
        </span>
      </div>
    </button>
  )
}
