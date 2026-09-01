'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/pin')
  }

  async function handlePushSubscribe() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta notificaciones push')
      return
    }

    setPushStatus('loading')

    // iOS requiere que la app esté instalada en la pantalla de inicio
    const isStandalone =
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches

    if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone) {
      setPushStatus('idle')
      alert('En iPhone, primero añade la app a la pantalla de inicio (Safari → Compartir → Añadir a pantalla de inicio) y ábrela desde ahí.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPushStatus('denied')
        return
      }

      const keyRes = await fetch('/api/push/vapid-key')
      const { publicKey } = await keyRes.json()
      if (!publicKey) throw new Error('VAPID public key no configurada')

      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Service worker tardó demasiado')), 8000)
        ),
      ])

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!res.ok) throw new Error(`Error al guardar suscripción: ${res.status}`)

      setPushStatus('ok')
    } catch (err) {
      console.error('Push subscribe error:', err)
      setPushStatus('idle')
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 24px', maxWidth: 512, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--c-text)', margin: 0 }}>
        AJUSTES
      </h1>

      {/* Cuenta */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Cuenta
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: 'var(--c-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            U
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>Usuario</p>
            <p style={{ fontSize: 12, color: 'var(--c-dim)', margin: '2px 0 0' }}>Sesión activa</p>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Notificaciones
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)', margin: 0 }}>Recordatorio diario</p>
            <p style={{ fontSize: 12, color: 'var(--c-dim)', margin: '2px 0 0' }}>A las 21:00 si no has rellenado el día</p>
          </div>
          <button
            onClick={handlePushSubscribe}
            disabled={pushStatus === 'loading' || pushStatus === 'ok'}
            style={{
              padding: '8px 14px',
              background: pushStatus === 'ok' ? 'var(--c-surface2)' : 'var(--c-accent)',
              border: '1px solid var(--c-border)',
              color: pushStatus === 'ok' ? 'var(--c-dim)' : '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: pushStatus === 'loading' || pushStatus === 'ok' ? 'not-allowed' : 'pointer',
              opacity: pushStatus === 'loading' ? 0.7 : 1,
              flexShrink: 0,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {pushStatus === 'idle' && 'Activar'}
            {pushStatus === 'loading' && 'Activando...'}
            {pushStatus === 'ok' && 'Activado'}
            {pushStatus === 'denied' && 'Denegado'}
          </button>
        </div>
      </div>

      {/* Sesión */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Sesión
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 0',
            background: 'var(--c-bg)',
            border: '1px solid var(--c-fat)',
            color: 'var(--c-fat)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
