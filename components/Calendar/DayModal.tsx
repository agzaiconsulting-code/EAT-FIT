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

  const isPast = fecha < today
  const canEdit = (isToday || isPast) && !readOnly

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        background: 'rgba(3,4,15,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(160deg, #110E2E 0%, #090719 100%)',
          border: '1px solid rgba(167,139,250,0.15)',
          borderBottom: 'none',
          borderRadius: '28px 28px 0 0',
          padding: '12px 20px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(167,139,250,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              {new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' })}
            </p>
            <p style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: 20, letterSpacing: '-0.02em' }}>
              {formatFecha(fecha).replace(/^[^,]+,\s*/, '')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              color: 'rgba(255,255,255,0.4)',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {canEdit && (
          <>
            {/* Comida */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Comida
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setComida(comida === 'fit' ? null : 'fit')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: comida === 'fit' ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)',
                    border: comida === 'fit' ? '1.5px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    color: comida === 'fit' ? '#34D399' : 'rgba(255,255,255,0.3)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  FIT
                </button>
                <button
                  onClick={() => setComida(comida === 'fat' ? null : 'fat')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: comida === 'fat' ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.04)',
                    border: comida === 'fat' ? '1.5px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    color: comida === 'fat' ? '#F87171' : 'rgba(255,255,255,0.3)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  FAT
                </button>
              </div>
            </div>

            {/* Deporte */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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
                        padding: '7px 14px',
                        background: selected ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                        border: selected ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        color: selected ? '#C4B5FD' : 'rgba(255,255,255,0.35)',
                        fontSize: 12,
                        fontWeight: 600,
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
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
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
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Alcohol{noAlcohol ? ' ✓' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setCervezas((n) => Math.max(0, n - 1))}
                  style={{
                    width: 38,
                    height: 38,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    color: 'var(--c-text)',
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: 24, fontWeight: 800, color: cervezas > 0 ? '#F87171' : '#34D399', minWidth: 32, textAlign: 'center', letterSpacing: '-0.02em' }}>
                  {cervezas}
                </span>
                <button
                  onClick={() => setCervezas((n) => n + 1)}
                  style={{
                    width: 38,
                    height: 38,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    color: 'var(--c-text)',
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
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
                padding: '15px 0',
                background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                border: 'none',
                borderRadius: 16,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              }}
            >
              {saving ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </>
        )}

        {/* Read-only: partner view */}
        {!canEdit && registro && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {registro.comida && (
              <div style={{
                display: 'inline-flex',
                padding: '8px 16px',
                borderRadius: 12,
                background: registro.comida === 'fit' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                border: `1px solid ${registro.comida === 'fit' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: registro.comida === 'fit' ? '#34D399' : '#F87171',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.06em',
                alignSelf: 'flex-start',
              }}>
                {registro.comida === 'fit' ? 'FIT' : 'FAT'}
              </div>
            )}
            {registro.gimnasio && registro.deportes.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Deporte
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {registro.deportes.map((d) => (
                    <span
                      key={d.tipo}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(167,139,250,0.15)',
                        border: '1px solid rgba(167,139,250,0.3)',
                        borderRadius: 20,
                        color: '#C4B5FD',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {d.tipo}{d.tipo === 'Correr' && d.kms ? ` ${d.kms}km` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontSize: 13, fontWeight: 600, color: (registro.cervezas ?? 0) === 0 ? '#34D399' : '#F87171' }}>
              {(registro.cervezas ?? 0) === 0
                ? '✓ Sin alcohol'
                : `${registro.cervezas} cerveza${registro.cervezas > 1 ? 's' : ''}`}
            </p>
            {!registro.comida && !registro.gimnasio && (registro.cervezas ?? 0) === 0 && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Sin datos para este día</p>
            )}
          </div>
        )}

        {!canEdit && !registro && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Sin datos para este día</p>
        )}
      </div>
    </div>
  )
}
