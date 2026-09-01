'use client'

import { useState, useEffect, useCallback } from 'react'
import { calcStats, RegistroConDeportes } from '@/lib/stats'

interface StatsClientProps {
  myUserId: string
  myNombre: string
  partner: { id: string; nombre: string } | null
}

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export default function StatsClient({ myUserId, myNombre, partner }: StatsClientProps) {
  const now = new Date()
  const [mes, setMes] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [viewingUserId, setViewingUserId] = useState(myUserId)
  const [registros, setRegistros] = useState<RegistroConDeportes[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/registros?mes=${mes}&userId=${viewingUserId}`)
    const data = await res.json()
    setRegistros(
      Array.isArray(data)
        ? data.map((r: RegistroConDeportes & { deportes_dia?: { tipo: string; kms: number | null }[] }) => ({
            ...r,
            deportes: r.deportes_dia ?? r.deportes ?? [],
          }))
        : []
    )
    setLoading(false)
  }, [mes, viewingUserId])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = calcStats(registros, mes)
  const [mesYear, mesMonth] = mes.split('-').map(Number)
  const isViewingMine = viewingUserId === myUserId

  function changeMes(delta: number) {
    const d = new Date(mesYear, mesMonth - 1 + delta, 1)
    setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    padding: 16,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 24px', maxWidth: 512, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--c-text)', margin: 0 }}>
        ESTADÍSTICAS
      </h1>

      {/* Partner toggle */}
      {partner && (
        <div style={{ display: 'flex', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
          <button
            onClick={() => setViewingUserId(myUserId)}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 500,
              background: isViewingMine ? 'var(--c-accent)' : 'var(--c-surface)',
              color: 'var(--c-text)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {myNombre}
          </button>
          <button
            onClick={() => setViewingUserId(partner.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 13,
              fontWeight: 500,
              background: !isViewingMine ? 'var(--c-accent)' : 'var(--c-surface)',
              color: 'var(--c-text)',
              border: 'none',
              borderLeft: '1px solid var(--c-border)',
              cursor: 'pointer',
            }}
          >
            {partner.nombre}
          </button>
        </div>
      )}

      {/* Month picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => changeMes(-1)}
          style={{
            width: 36,
            height: 36,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text)',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--c-text)', letterSpacing: '0.05em' }}>
          {MESES[mesMonth - 1].toUpperCase()} {mesYear}
        </span>
        <button
          onClick={() => changeMes(1)}
          style={{
            width: 36,
            height: 36,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text)',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          →
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-dim)', fontSize: 14 }}>
          Cargando...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 2x2 stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatCard label="Días Fit" value={stats.diasFit} color="var(--c-fit)" />
            <StatCard label="Días Fat" value={stats.diasFat} color="var(--c-fat)" />
            <StatCard label="Días Deporte" value={stats.diasDeporte} color="var(--c-accent)" />
            <StatCard label="Semanas +" value={stats.semanasDoradas} color="var(--c-gold)" />
          </div>

          {/* Streak */}
          {stats.rachaFit > 0 && (
            <div
              style={{
                ...cardStyle,
                borderLeft: '3px solid var(--c-accent)',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--c-dim)', margin: 0 }}>Racha actual</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-accent)', margin: '4px 0 0' }}>
                {stats.rachaFit} días fit consecutivos
              </p>
            </div>
          )}

          {/* Sport breakdown */}
          {Object.keys(stats.deportesCounts).length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, margin: '0 0 12px' }}>
                Sesiones por deporte
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stats.deportesCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tipo, count]) => {
                    const max = Math.max(...Object.values(stats.deportesCounts))
                    return (
                      <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--c-text)', width: 80, flexShrink: 0 }}>{tipo}</span>
                        <div style={{ flex: 1, height: 4, background: 'var(--c-border2)' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${(count / max) * 100}%`,
                              background: 'var(--c-accent)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', width: 20, textAlign: 'right' }}>
                          {count}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Total km */}
          {stats.totalKms > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                Total corrido
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>
                {stats.totalKms.toFixed(1)} km
              </p>
            </div>
          )}

          {stats.diasConDatos === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-dim)', fontSize: 14 }}>
              Sin datos para este mes
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--c-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}
