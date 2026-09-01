'use client'

import { DayRecord } from '@/lib/dayColor'

interface DayCellProps {
  fecha: string
  record?: DayRecord | null
  onClick: () => void
  isToday: boolean
  isFuture: boolean
}

export default function DayCell({ fecha, record, onClick, isToday, isFuture }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const hasData = !!(record?.comida || record?.gimnasio)
  const isEmpty = !hasData

  const pips: { color: string; key: string }[] = []
  if (record?.comida === 'fit') pips.push({ color: 'var(--c-fit)', key: 'fit' })
  if (record?.comida === 'fat') pips.push({ color: 'var(--c-fat)', key: 'fat' })
  if (record?.gimnasio) pips.push({ color: 'var(--c-accent)', key: 'sport' })

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      style={{
        background: isEmpty ? 'var(--c-bg)' : 'var(--c-surface)',
        border: 'none',
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
        position: 'relative',
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
      {pips.length > 0 && (
        <div style={{ display: 'flex', gap: 2, alignSelf: 'center' }}>
          {pips.map((pip) => (
            <div
              key={pip.key}
              style={{
                width: 3.5,
                height: 3.5,
                background: pip.color,
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}
