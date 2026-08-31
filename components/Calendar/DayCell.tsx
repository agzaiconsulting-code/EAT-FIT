'use client'

import { dayColor, COLOR_HEX, DayRecord } from '@/lib/dayColor'

interface DayCellProps {
  fecha: string
  record?: DayRecord | null
  onClick: () => void
  isToday: boolean
}

export default function DayCell({ fecha, record, onClick, isToday }: DayCellProps) {
  const day = parseInt(fecha.split('-')[2], 10)
  const color = dayColor(record, fecha)
  const hex = COLOR_HEX[color]
  const isObjetivo = color === 'objetivo'

  return (
    <button
      onClick={onClick}
      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform relative"
      style={{
        background: hex,
        boxShadow: isToday
          ? `0 0 0 2.5px #FFD966, var(--shadow-clay-sm)`
          : 'var(--shadow-clay-sm)',
        outline: isObjetivo ? '2.5px solid #FFD966' : 'none',
        outlineOffset: '2px',
      }}
    >
      <span className="text-sm font-semibold text-clay-text leading-none">{day}</span>
      {record?.gimnasio && !isObjetivo && (
        <span className="text-[10px] leading-none opacity-70">🏃</span>
      )}
    </button>
  )
}
