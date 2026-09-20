'use client'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MonthHeaderProps {
  year: number
  month: number
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

  const navBtn: React.CSSProperties = {
    width: 32,
    height: 32,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '50%',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const pill: React.CSSProperties = {
    padding: '5px 13px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
      {/* Row 1: month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onPrev} style={navBtn}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.01em' }}>
          {MESES[month - 1]}{' '}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{year}</span>
        </span>
        <button onClick={onNext} style={navBtn}>›</button>
      </div>

      {/* Row 2: tabs */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={onHoy}
          style={{
            ...pill,
            background: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Hoy
        </button>

        {partnerNombre && (
          <>
            <button
              onClick={() => !isViewingMine && onToggleUser()}
              style={{
                ...pill,
                background: isViewingMine ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: isViewingMine ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)',
                color: isViewingMine ? '#C4B5FD' : 'rgba(255,255,255,0.3)',
                cursor: isViewingMine ? 'default' : 'pointer',
              }}
            >
              Yo
            </button>
            <button
              onClick={() => isViewingMine && onToggleUser()}
              style={{
                ...pill,
                background: !isViewingMine ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: !isViewingMine ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)',
                color: !isViewingMine ? '#C4B5FD' : 'rgba(255,255,255,0.3)',
                cursor: !isViewingMine ? 'default' : 'pointer',
              }}
            >
              {partnerNombre}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
