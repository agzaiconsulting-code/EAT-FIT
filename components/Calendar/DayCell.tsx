'use client'

import { DayRecord } from '@/lib/dayColor'

interface DayCellProps {
  fecha: string
  record?: DayRecord | null
  onClick: () => void
  isToday: boolean
  isFuture: boolean
}

function cellColor(record: DayRecord | null | undefined): string | null {
  if (!record) return null
  const fit = record.comida === 'fit'
  const sport = record.gimnasio
  const alcohol = (record.cervezas ?? 0) > 0

  if (!record.comida && !sport && !alcohol) return null

  if (fit && sport && !alcohol) return 'var(--c-fit)'   // verde
  if (fit && sport && alcohol) return 'var(--c-gold)'   // amarillo
  if (!fit && !sport && alcohol) return 'var(--c-fat)'  // rojo
  return 'var(--c-accent)'                               // naranja
}

export default function DayCell({ fecha, record, onClick, isToday, isFuture }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const color = cellColor(record)
  const hasData = color !== null

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      style={{
        background: hasData ? color : 'var(--c-bg)',
        border: '1px solid #222222',
        outline: isToday ? '2px solid var(--c-accent)' : 'none',
        outlineOffset: isToday ? -2 : undefined,
        cursor: isFuture ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '4px 5px',
        minHeight: '100%',
        width: '100%',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: hasData ? 'rgba(0,0,0,0.75)' : 'var(--c-muted)',
          lineHeight: 1,
        }}
      >
        {day}
      </span>
    </button>
  )
}
