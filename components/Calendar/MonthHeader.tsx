'use client'

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
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

  const navBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text)',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px' }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onPrev} style={navBtnStyle}>←</button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', color: 'var(--c-text)' }}>
            {MESES[month - 1]} {year}
          </p>
        </div>

        <button onClick={onNext} style={navBtnStyle}>→</button>
      </div>

      {/* Hoy + partner toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onHoy}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text)',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          HOY
        </button>

        {partnerNombre && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              border: '1px solid var(--c-border)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => !isViewingMine && onToggleUser()}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 500,
                background: isViewingMine ? 'var(--c-accent)' : 'var(--c-surface)',
                color: 'var(--c-text)',
                border: 'none',
                cursor: isViewingMine ? 'default' : 'pointer',
              }}
            >
              YO
            </button>
            <button
              onClick={() => isViewingMine && onToggleUser()}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 500,
                background: !isViewingMine ? 'var(--c-accent)' : 'var(--c-surface)',
                color: 'var(--c-text)',
                border: 'none',
                borderLeft: '1px solid var(--c-border)',
                cursor: !isViewingMine ? 'default' : 'pointer',
              }}
            >
              {partnerNombre.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
