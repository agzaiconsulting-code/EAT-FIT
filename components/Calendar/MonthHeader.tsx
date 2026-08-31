'use client'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MonthHeaderProps {
  year: number
  month: number // 1-12
  onPrev: () => void
  onNext: () => void
  onHoy: () => void
  viewingUserId: string
  myUserId: string
  partnerNombre: string | null
  onToggleUser: () => void
}

export default function MonthHeader({
  year,
  month,
  onPrev,
  onNext,
  onHoy,
  viewingUserId,
  myUserId,
  partnerNombre,
  onToggleUser,
}: MonthHeaderProps) {
  const isViewingMine = viewingUserId === myUserId

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-clay-text text-lg active:scale-95 transition-transform"
          style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}
        >
          ←
        </button>

        <div className="text-center">
          <p className="font-bold text-lg text-clay-text leading-tight">
            {MESES[month - 1]}
          </p>
          <p className="text-sm text-clay-gray-dark">{year}</p>
        </div>

        <button
          onClick={onNext}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-clay-text text-lg active:scale-95 transition-transform"
          style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}
        >
          →
        </button>
      </div>

      {/* User toggle + Hoy */}
      <div className="flex items-center gap-2">
        <button
          onClick={onHoy}
          className="text-xs px-3 py-1.5 rounded-xl text-clay-text font-medium active:scale-95 transition-transform"
          style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}
        >
          Hoy
        </button>

        {partnerNombre && (
          <div
            className="flex-1 flex rounded-2xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}
          >
            <button
              onClick={() => !isViewingMine && onToggleUser()}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                isViewingMine
                  ? 'bg-clay-yellow text-clay-text rounded-2xl'
                  : 'text-clay-gray-dark'
              }`}
            >
              Yo
            </button>
            <button
              onClick={() => isViewingMine && onToggleUser()}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                !isViewingMine
                  ? 'bg-clay-yellow text-clay-text rounded-2xl'
                  : 'text-clay-gray-dark'
              }`}
            >
              {partnerNombre}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
