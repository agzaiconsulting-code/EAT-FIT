'use client'

import { useState, useEffect, useCallback } from 'react'
import { calcStats, RegistroConDeportes } from '@/lib/stats'
import ClayCard from '@/components/ClayCard'

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
    setRegistros(Array.isArray(data) ? data.map((r: RegistroConDeportes & { deportes_dia?: { tipo: string; kms: number | null }[] }) => ({
      ...r,
      deportes: r.deportes_dia ?? r.deportes ?? [],
    })) : [])
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

  const totalDias = stats.colorCounts.verde + stats.colorCounts.naranja + stats.colorCounts.rojo + stats.colorCounts.gris

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <h1 className="text-2xl font-bold text-clay-text">Estadísticas</h1>

      {/* User toggle */}
      {partner && (
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}
        >
          <button
            onClick={() => setViewingUserId(myUserId)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isViewingMine ? 'bg-clay-yellow rounded-2xl' : 'text-clay-gray-dark'}`}
          >
            {myNombre}
          </button>
          <button
            onClick={() => setViewingUserId(partner.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isViewingMine ? 'bg-clay-yellow rounded-2xl' : 'text-clay-gray-dark'}`}
          >
            {partner.nombre}
          </button>
        </div>
      )}

      {/* Month picker */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => changeMes(-1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}>←</button>
        <span className="font-semibold text-clay-text">{MESES[mesMonth - 1]} {mesYear}</span>
        <button onClick={() => changeMes(1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ boxShadow: 'var(--shadow-clay-sm)', background: '#fff' }}>→</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-3xl animate-pulse">📊</div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <StatMini emoji="🏆" label="Días verdes" value={stats.colorCounts.verde} color="#A8D48A" />
            <StatMini emoji="🔥" label="Racha verde" value={`${stats.rachaVerde}d`} color="#FFD966" />
            <StatMini emoji="🏃" label="Km corridos" value={`${stats.totalKms.toFixed(1)}km`} color="#FFB870" />
          </div>

          {/* Color breakdown */}
          <ClayCard className="p-4">
            <p className="text-sm font-semibold text-clay-gray-dark mb-3">Distribución del mes</p>
            <div className="flex gap-2 h-8 rounded-xl overflow-hidden">
              {[
                { color: '#A8D48A', count: stats.colorCounts.verde },
                { color: '#FFB870', count: stats.colorCounts.naranja },
                { color: '#FF8A8A', count: stats.colorCounts.rojo },
                { color: '#E5E3D8', count: stats.colorCounts.gris },
              ].map(({ color, count }) => (
                count > 0 && (
                  <div
                    key={color}
                    className="rounded-xl flex items-center justify-center text-xs font-bold text-clay-text"
                    style={{ background: color, flex: count }}
                  >
                    {count}
                  </div>
                )
              ))}
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {[
                { color: '#A8D48A', label: 'Verde', count: stats.colorCounts.verde },
                { color: '#FFB870', label: 'Naranja', count: stats.colorCounts.naranja },
                { color: '#FF8A8A', label: 'Rojo', count: stats.colorCounts.rojo },
                { color: '#E5E3D8', label: 'Sin datos', count: stats.colorCounts.gris },
              ].map(({ color, label, count }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-clay-gray-dark">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  {label}: {count}
                </div>
              ))}
            </div>
          </ClayCard>

          {/* Sports breakdown */}
          {Object.keys(stats.deportesCounts).length > 0 && (
            <ClayCard className="p-4">
              <p className="text-sm font-semibold text-clay-gray-dark mb-3">Sesiones por deporte</p>
              <div className="flex flex-col gap-2">
                {Object.entries(stats.deportesCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between">
                      <span className="text-sm text-clay-text">{tipo}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-clay-gray overflow-hidden">
                          <div
                            className="h-full rounded-full bg-clay-yellow"
                            style={{ width: `${(count / Math.max(...Object.values(stats.deportesCounts))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-clay-text w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </ClayCard>
          )}

          {stats.diasConDatos === 0 && (
            <div className="text-center py-8 text-clay-gray-dark">
              <p className="text-4xl mb-2">🌱</p>
              <p className="text-sm">Sin datos aún para este mes</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatMini({ emoji, label, value, color }: { emoji: string; label: string; value: string | number; color: string }) {
  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-1 items-center text-center"
      style={{ background: color, boxShadow: 'var(--shadow-clay-sm)' }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-bold text-clay-text">{value}</span>
      <span className="text-[10px] text-clay-text opacity-70 leading-tight">{label}</span>
    </div>
  )
}
