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

const VARIANT_STYLES: Record<DayVariant, { bg: string; color: string }> = {
  fit:   { bg: 'rgba(52,211,153,0.28)',  color: '#34D399' },
  fat:   { bg: 'rgba(248,113,113,0.28)', color: '#F87171' },
  gold:  { bg: 'rgba(252,211,77,0.28)',  color: '#FCD34D' },
  mixed: { bg: 'rgba(167,139,250,0.22)', color: '#C4B5FD' },
  empty: { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' },
}

export default function DayCell({ fecha, record, onClick, isToday, isFuture }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const variant = getDayVariant(record)
  const { bg, color } = VARIANT_STYLES[variant]

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
        padding: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          width: '80%',
          aspectRatio: '1',
          borderRadius: '50%',
          background: isFuture ? 'transparent' : bg,
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
