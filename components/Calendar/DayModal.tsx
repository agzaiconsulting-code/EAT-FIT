'use client'

import { useState, useEffect } from 'react'

const DEPORTES = ['BodyPump', 'Spinning', 'Correr', 'Padel', 'Gym'] as const
type Deporte = (typeof DEPORTES)[number]

interface DeporteEntry {
  tipo: Deporte
  kms?: number
}

interface RegistroData {
  comida: 'fit' | 'fat' | null
  gimnasio: boolean
  objetivo: boolean
  deportes: { tipo: string; kms: number | null }[]
}

interface DayModalProps {
  fecha: string
  registro: RegistroData | null
  readOnly: boolean
  onClose: () => void
  onSave: (fecha: string, data: Partial<RegistroData>) => Promise<void>
}

function formatFecha(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function DayModal({ fecha, registro, readOnly, onClose, onSave }: DayModalProps) {
  const today = new Date().toISOString().split('T')[0]
  const isFuture = fecha > today
  const isToday = fecha === today

  const [comida, setComida] = useState<'fit' | 'fat' | null>(registro?.comida ?? null)
  const [deportesSeleccionados, setDeportes] = useState<DeporteEntry[]>(
    (registro?.deportes ?? []).map((d) => ({ tipo: d.tipo as Deporte, kms: d.kms ?? undefined }))
  )
  const [objetivo, setObjetivo] = useState(registro?.objetivo ?? false)
  const [saving, setSaving] = useState(false)

  const gimnasio = deportesSeleccionados.length > 0

  function toggleDeporte(tipo: Deporte) {
    setDeportes((prev) => {
      const exists = prev.find((d) => d.tipo === tipo)
      if (exists) return prev.filter((d) => d.tipo !== tipo)
      return [...prev, { tipo }]
    })
  }

  function setKms(kms: number) {
    setDeportes((prev) =>
      prev.map((d) => (d.tipo === 'Correr' ? { ...d, kms } : d))
    )
  }

  const correrEntry = deportesSeleccionados.find((d) => d.tipo === 'Correr')

  async function handleSave() {
    setSaving(true)
    await onSave(fecha, {
      comida,
      gimnasio,
      objetivo,
      deportes: deportesSeleccionados.map((d) => ({
        tipo: d.tipo,
        kms: d.kms ?? null,
      })),
    })
    setSaving(false)
    onClose()
  }

  const canEdit = isToday || isFuture
  const effectiveReadOnly = readOnly || (!isToday && !isFuture)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[2rem] bg-white p-6 pb-8 flex flex-col gap-5"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-clay-gray mx-auto" />

        {/* Date */}
        <div className="text-center">
          <p className="font-bold text-clay-text capitalize">{formatFecha(fecha)}</p>
          {effectiveReadOnly && !isFuture && (
            <p className="text-xs text-clay-gray-dark mt-0.5">Solo lectura</p>
          )}
        </div>

        {/* Future day — only objetivo */}
        {isFuture && (
          <label className="flex items-center justify-between px-1">
            <span className="font-medium text-clay-text">Marcar como objetivo ⭐</span>
            <ToggleSwitch value={objetivo} onChange={setObjetivo} disabled={readOnly} />
          </label>
        )}

        {/* Today — full edit */}
        {isToday && !readOnly && (
          <>
            {/* Comida */}
            <div>
              <p className="text-sm font-semibold text-clay-gray-dark mb-2">Comida</p>
              <div className="flex gap-3">
                <ChoiceButton
                  label="🥗 Fit"
                  active={comida === 'fit'}
                  color="#A8D48A"
                  onClick={() => setComida(comida === 'fit' ? null : 'fit')}
                />
                <ChoiceButton
                  label="🍔 Fat"
                  active={comida === 'fat'}
                  color="#FF8A8A"
                  onClick={() => setComida(comida === 'fat' ? null : 'fat')}
                />
              </div>
            </div>

            {/* Deportes */}
            <div>
              <p className="text-sm font-semibold text-clay-gray-dark mb-2">
                Deporte {gimnasio && '✓'}
              </p>
              <div className="flex flex-wrap gap-2">
                {DEPORTES.map((tipo) => {
                  const selected = deportesSeleccionados.some((d) => d.tipo === tipo)
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleDeporte(tipo)}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={{
                        background: selected ? '#FFD966' : '#F5F4EE',
                        boxShadow: selected ? 'var(--shadow-clay-sm)' : 'var(--shadow-clay-inset)',
                        color: '#3D3A2E',
                      }}
                    >
                      {tipo}
                    </button>
                  )
                })}
              </div>

              {correrEntry && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm text-clay-text">Km corridos:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={correrEntry.kms ?? ''}
                    onChange={(e) => setKms(parseFloat(e.target.value))}
                    className="w-20 rounded-xl px-3 py-1.5 text-sm text-center font-medium outline-none"
                    style={{ boxShadow: 'var(--shadow-clay-inset)', background: '#FFFBEA' }}
                  />
                </div>
              )}
            </div>

            {/* Objetivo */}
            <label className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-clay-text">También es un objetivo</span>
              <ToggleSwitch value={objetivo} onChange={setObjetivo} />
            </label>
          </>
        )}

        {/* Past day read-only */}
        {!isToday && !isFuture && registro && (
          <div className="flex flex-col gap-3 text-sm text-clay-text">
            {registro.comida && (
              <p>Comida: <strong>{registro.comida === 'fit' ? '🥗 Fit' : '🍔 Fat'}</strong></p>
            )}
            {registro.gimnasio && (
              <div>
                <p className="font-medium mb-1">Deportes:</p>
                <div className="flex flex-wrap gap-2">
                  {registro.deportes.map((d) => (
                    <span
                      key={d.tipo}
                      className="px-3 py-1 rounded-xl text-sm"
                      style={{ background: '#FFD966' }}
                    >
                      {d.tipo}{d.tipo === 'Correr' && d.kms ? ` ${d.kms}km` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!registro.comida && !registro.gimnasio && (
              <p className="text-clay-gray-dark">Sin datos para este día</p>
            )}
          </div>
        )}

        {/* Save button */}
        {canEdit && !readOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-semibold text-clay-text active:scale-95 transition-transform"
            style={{ background: '#FFD966', boxShadow: 'var(--shadow-clay)' }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        )}

        <button
          onClick={onClose}
          className="text-center text-sm text-clay-gray-dark py-1"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

function ChoiceButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
      style={{
        background: active ? color : '#F5F4EE',
        boxShadow: active ? 'var(--shadow-clay)' : 'var(--shadow-clay-inset)',
        color: '#3D3A2E',
      }}
    >
      {label}
    </button>
  )
}

function ToggleSwitch({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className="w-12 h-6 rounded-full relative transition-colors"
      style={{ background: value ? '#FFD966' : '#E5E3D8' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{
          transform: `translateX(${value ? '26px' : '2px'})`,
          boxShadow: '1px 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
