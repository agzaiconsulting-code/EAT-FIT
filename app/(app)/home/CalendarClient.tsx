'use client'

import { useState, useEffect, useCallback } from 'react'
import MonthGrid from '@/components/Calendar/MonthGrid'
import MonthHeader from '@/components/Calendar/MonthHeader'
import DayModal from '@/components/Calendar/DayModal'
import { DayRecord } from '@/lib/dayColor'

interface Registro extends DayRecord {
  id: string
  fecha: string
  deportes: { tipo: string; kms: number | null }[]
}

interface CalendarClientProps {
  myUserId: string
  myNombre: string
  partner: { id: string; nombre: string; avatar_url: string | null } | null
}

function isoToYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function CalendarClient({ myUserId, myNombre, partner }: CalendarClientProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [viewingUserId, setViewingUserId] = useState(myUserId)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null)

  const mes = `${year}-${String(month).padStart(2, '0')}`
  const isReadOnly = viewingUserId !== myUserId

  const fetchRegistros = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/registros?mes=${mes}&userId=${viewingUserId}`)
    const data = await res.json()
    setRegistros(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [mes, viewingUserId])

  useEffect(() => {
    fetchRegistros()
  }, [fetchRegistros])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  function goHoy() {
    const n = new Date()
    setYear(n.getFullYear())
    setMonth(n.getMonth() + 1)
  }

  const byFecha: Record<string, Registro> = {}
  for (const r of registros) byFecha[r.fecha] = r

  const selectedRegistro = selectedFecha ? byFecha[selectedFecha] ?? null : null

  async function handleSave(fecha: string, data: Partial<DayRecord & { deportes: { tipo: string; kms: number | null }[] }>) {
    await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, ...data }),
    })
    await fetchRegistros()
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      <div className="pt-4">
        <MonthHeader
          year={year}
          month={month}
          onPrev={prevMonth}
          onNext={nextMonth}
          onHoy={goHoy}
          viewingUserId={viewingUserId}
          myUserId={myUserId}
          partnerNombre={partner?.nombre ?? null}
          onToggleUser={() =>
            setViewingUserId((id) => (id === myUserId ? (partner?.id ?? myUserId) : myUserId))
          }
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-3xl animate-pulse">📅</div>
      ) : (
        <MonthGrid
          year={year}
          month={month}
          registros={byFecha}
          onDayClick={setSelectedFecha}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pb-2">
        {[
          { color: '#A8D48A', label: 'Fit + deporte' },
          { color: '#FFB870', label: 'Solo uno' },
          { color: '#FF8A8A', label: 'Fat sin deporte' },
          { color: '#E5E3D8', label: 'Sin datos' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-clay-gray-dark">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {selectedFecha && (
        <DayModal
          fecha={selectedFecha}
          registro={selectedRegistro}
          readOnly={isReadOnly}
          onClose={() => setSelectedFecha(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
