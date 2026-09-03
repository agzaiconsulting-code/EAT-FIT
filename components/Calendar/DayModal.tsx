'use client'

import { useState } from 'react'

const DEPORTES = ['BodyPump', 'Spinning', 'Correr', 'Padel', 'Gym'] as const
type Deporte = (typeof DEPORTES)[number]

interface DeporteEntry {
  tipo: Deporte
  kms?: number
}

interface RegistroData {
  comida: 'fit' | 'fat' | null
  gimnasio: boolean
  cervezas: number
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
  const isToday = fecha === today

  const [comida, setComida] = useState<'fit' | 'fat' | null>(registro?.comida ?? null)
  const [deportesSeleccionados, setDeportes] = useState<DeporteEntry[]>(
    (registro?.deportes ?? []).map((d) => ({ tipo: d.tipo as Deporte, kms: d.kms ?? undefined }))
  )
  const [cervezas, setCervezas] = useState<number>(registro?.cervezas ?? 0)
  const [saving, setSaving] = useState(false)

  const gimnasio = deportesSeleccionados.length > 0
  const noAlcohol = cervezas === 0

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
      cervezas,
      deportes: deportesSeleccionados.map((d) => ({
        tipo: d.tipo,
        kms: d.kms ?? null,
      })),
    })
    setSaving(false)
    onClose()
  }

  const canEdit = isToday && !readOnly

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 512,
          background: 'var(--c-surface)',
          borderTop: '2px solid var(--c-accent)',
          padding: '20px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700, color: 'var(--c-text)', textTransform: 'capitalize', fontSize: 14 }}>
            {formatFecha(fecha)}
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'var(--c-surface2)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-dim)',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {canEdit && (
          <>
            {/* Comida */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Comida
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setComida(comida === 'fit' ? null : 'fit')}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: comida === 'fit' ? 'var(--c-fit)' : 'var(--c-bg)',
                    border: comida === 'fit' ? '1px solid var(--c-fit)' : '1px solid var(--c-border2)',
                    color: comida === 'fit' ? '#000' : 'var(--c-dim)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  FIT
                </button>
                <button
                  onClick={() => setComida(comida === 'fat' ? null : 'fat')}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: comida === 'fat' ? 'var(--c-fat)' : 'var(--c-bg)',
                    border: comida === 'fat' ? '1px solid var(--c-fat)' : '1px solid var(--c-border2)',
                    color: comida === 'fat' ? '#fff' : 'var(--c-dim)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  FAT
                </button>
              </div>
            </div>

            {/* Deporte */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Deporte{gimnasio ? ' ✓' : ''}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DEPORTES.map((tipo) => {
                  const selected = deportesSeleccionados.some((d) => d.tipo === tipo)
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleDeporte(tipo)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--c-bg)',
                        border: selected ? '1px solid var(--c-accent)' : '1px solid var(--c-border2)',
                        color: selected ? 'var(--c-accent)' : 'var(--c-dim)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {tipo}
                    </button>
                  )
                })}
              </div>

              {correrEntry && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <label style={{ fontSize: 13, color: 'var(--c-text)' }}>Km:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={correrEntry.kms ?? ''}
                    onChange={(e) => setKms(parseFloat(e.target.value))}
                    style={{
                      width: 80,
                      padding: '6px 10px',
                      background: 'var(--c-bg)',
                      border: '1px solid var(--c-border2)',
                      color: 'var(--c-text)',
                      fontSize: 14,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Alcohol */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Alcohol{noAlcohol ? ' ✓' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setCervezas((n) => Math.max(0, n - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--c-bg)',
                    border: '1px solid var(--c-border2)',
                    color: 'var(--c-text)',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: 16, fontWeight: 700, color: cervezas > 0 ? 'var(--c-fat)' : 'var(--c-fit)', minWidth: 24, textAlign: 'center' }}>
                  {cervezas}
                </span>
                <button
                  onClick={() => setCervezas((n) => n + 1)}
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--c-bg)',
                    border: '1px solid var(--c-border2)',
                    color: 'var(--c-text)',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
                <span style={{ fontSize: 13, color: 'var(--c-dim)' }}>
                  {cervezas === 0 ? 'Sin alcohol' : `${cervezas} cerveza${cervezas > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'var(--c-accent)',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </>
        )}

        {/* Read-only: past day or partner view */}
        {!canEdit && registro && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {registro.comida && (
              <p style={{ fontSize: 14, color: 'var(--c-text)' }}>
                Comida:{' '}
                <strong style={{ color: registro.comida === 'fit' ? 'var(--c-fit)' : 'var(--c-fat)' }}>
                  {registro.comida === 'fit' ? 'FIT' : 'FAT'}
                </strong>
              </p>
            )}
            {registro.gimnasio && registro.deportes.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Deportes
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {registro.deportes.map((d) => (
                    <span
                      key={d.tipo}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--c-bg)',
                        border: '1px solid var(--c-accent)',
                        color: 'var(--c-accent)',
                        fontSize: 13,
                      }}
                    >
                      {d.tipo}{d.tipo === 'Correr' && d.kms ? ` ${d.kms}km` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontSize: 14, color: (registro.cervezas ?? 0) === 0 ? 'var(--c-fit)' : 'var(--c-fat)' }}>
              {(registro.cervezas ?? 0) === 0
                ? '✓ Sin alcohol'
                : `🍺 ${registro.cervezas} cerveza${registro.cervezas > 1 ? 's' : ''}`}
            </p>
            {!registro.comida && !registro.gimnasio && (registro.cervezas ?? 0) === 0 && (
              <p style={{ fontSize: 14, color: 'var(--c-dim)' }}>Sin datos para este día</p>
            )}
          </div>
        )}

        {!canEdit && !registro && (
          <p style={{ fontSize: 14, color: 'var(--c-dim)' }}>Sin datos para este día</p>
        )}
      </div>
    </div>
  )
}
