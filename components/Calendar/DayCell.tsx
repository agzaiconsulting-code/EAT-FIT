'use client'

import { DayRecord } from '@/lib/dayColor'

interface DayCellProps {
  fecha: string
  record?: DayRecord | null
  onClick: () => void
  isToday: boolean
  isFuture: boolean
}

// fit + sport → verde | solo uno → naranja | fat sin sport → rojo | sin datos → vacío
function cellColor(record: DayRecord | null | undefined): string | null {
  if (!record || (!record.comida && !record.gimnasio)) return null
  if (record.comida === 'fit' && record.gimnasio) return 'var(--c-fit)'
  if (record.comida === 'fat' && !record.gimnasio) return 'var(--c-fat)'
  return 'var(--c-accent)' // solo uno de los dos
}

export default function DayCell({ fecha, record, onClick, isToday, isFuture }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const color = cellColor(record)
  const hasData = color !== null

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      style={{
        background: hasData ? 'var(--c-surface)' : 'var(--c-bg)',
        border: '1px solid #222222',
        outline: isToday ? '1.5px solid var(--c-accent)' : 'none',
        outlineOffset: -1,
        cursor: isFuture ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 4px 3px',
        minHeight: '100%',
        width: '100%',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: hasData ? 'var(--c-text)' : 'var(--c-muted)',
          lineHeight: 1,
          alignSelf: 'flex-start',
        }}
      >
        {day}
      </span>
      {color && (
        <div style={{ width: 6, height: 6, background: color }} />
      )}
    </button>
  )
}
