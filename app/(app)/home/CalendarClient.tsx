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
  const today = new Date().toISOString().split('T')[0]

  const fetchRegistros = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/registros?mes=${mes}&userId=${viewingUserId}`)
    const data = await res.json()
    setRegistros(
      Array.isArray(data)
        ? data.map((r: Registro & { deportes_dia?: { tipo: string; kms: number | null }[] }) => ({
            ...r,
            deportes: r.deportes_dia ?? r.deportes ?? [],
          }))
        : []
    )
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

  function handleDayClick(fecha: string) {
    if (fecha > today) return // future days not clickable
    setSelectedFecha(fecha)
  }

  async function handleSave(fecha: string, data: Partial<DayRecord & { deportes: { tipo: string; kms: number | null }[] }>) {
    await fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, ...data }),
    })
    await fetchRegistros()
  }

  return (
    <div
      style={{
        height: 'calc(100dvh - 48px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid var(--c-border)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--c-text)',
            margin: 0,
          }}
        >
          EAT<span style={{ color: 'var(--c-accent)' }}>&</span>FIT
        </h1>
      </div>

      {/* Calendar area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Month header */}
        <div style={{ padding: '8px 0 4px', flexShrink: 0 }}>
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

        {/* Grid */}
        <div style={{ flex: 1, minHeight: 0, padding: '0 8px 8px', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--c-dim)', fontSize: 14 }}>
              Cargando...
            </div>
          ) : (
            <MonthGrid
              year={year}
              month={month}
              registros={byFecha}
              onDayClick={handleDayClick}
            />
          )}
        </div>
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
