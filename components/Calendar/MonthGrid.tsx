'use client'

import DayCell from './DayCell'
import { DayRecord } from '@/lib/dayColor'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface MonthGridProps {
  year: number
  month: number
  registros: Record<string, DayRecord & { deportes?: { tipo: string; kms: number | null }[] }>
  onDayClick: (fecha: string) => void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function firstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function buildWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month)
  const startOffset = firstDayOfWeek(year, month)

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export default function MonthGrid({ year, month, registros, onDayClick }: MonthGridProps) {
  const today = new Date().toISOString().split('T')[0]
  const weeks = buildWeeks(year, month)

  function isGoldenWeek(week: (number | null)[]): boolean {
    let fitCount = 0
    let sportCount = 0
    for (const day of week) {
      if (!day) continue
      const fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (fecha > today) continue
      const r = registros[fecha]
      if (!r) continue
      if (r.comida === 'fit') fitCount++
      if (r.gimnasio) sportCount++
    }
    return fitCount >= 5 && sportCount >= 4
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingBottom: 4 }}>
        {DIAS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.25)',
              padding: '4px 0',
              letterSpacing: '0.08em',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => {
        const golden = isGoldenWeek(week)
        return (
          <div
            key={wi}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: '1fr',
              flex: 1,
              borderRadius: 12,
              padding: '2px',
              ...(golden
                ? {
                    background: 'rgba(252,211,77,0.05)',
                    outline: '1px solid rgba(252,211,77,0.18)',
                    outlineOffset: 0,
                  }
                : {}),
            }}
          >
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} />
              }
              const fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isFuture = fecha > today
              return (
                <DayCell
                  key={fecha}
                  fecha={fecha}
                  record={registros[fecha] ?? null}
                  onClick={() => onDayClick(fecha)}
                  isToday={fecha === today}
                  isFuture={isFuture}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
