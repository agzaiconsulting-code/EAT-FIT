'use client'

import DayCell from './DayCell'
import { DayRecord } from '@/lib/dayColor'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface MonthGridProps {
  year: number
  month: number // 1-12
  registros: Record<string, DayRecord>
  onDayClick: (fecha: string) => void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

// Returns 0=Monday...6=Sunday for the 1st of the month
function firstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay()
  return d === 0 ? 6 : d - 1 // Convert Sun=0 → 6, Mon=1 → 0
}

export default function MonthGrid({ year, month, registros, onDayClick }: MonthGridProps) {
  const today = new Date().toISOString().split('T')[0]
  const daysInMonth = getDaysInMonth(year, month)
  const startOffset = firstDayOfWeek(year, month)

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-col gap-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DIAS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-clay-gray-dark py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={i} className="aspect-square" />
          }
          const fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          return (
            <DayCell
              key={fecha}
              fecha={fecha}
              record={registros[fecha] ?? null}
              onClick={() => onDayClick(fecha)}
              isToday={fecha === today}
            />
          )
        })}
      </div>
    </div>
  )
}
