'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClayCard from '@/components/ClayCard'

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

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setPushStatus('denied')
      return
    }

    const keyRes = await fetch('/api/push/vapid-key')
    const { publicKey } = await keyRes.json()

    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    })

    setPushStatus('ok')
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <h1 className="text-2xl font-bold text-clay-text">Ajustes</h1>

      <ClayCard className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-clay-text">Recordatorios diarios</p>
          <p className="text-sm text-clay-gray-dark">
            Recibe una notificación a las 21:00 si no has rellenado el día
          </p>
        </div>

        <button
          onClick={handlePushSubscribe}
          disabled={pushStatus === 'loading' || pushStatus === 'ok'}
          className="py-3 rounded-2xl font-semibold text-clay-text active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: '#FFD966', boxShadow: 'var(--shadow-clay)' }}
        >
          {pushStatus === 'idle' && '🔔 Activar recordatorios'}
          {pushStatus === 'loading' && 'Activando…'}
          {pushStatus === 'ok' && '✅ Recordatorios activados'}
          {pushStatus === 'denied' && '❌ Permiso denegado'}
        </button>
      </ClayCard>

      <ClayCard className="p-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl font-semibold text-red-500 active:scale-95 transition-transform"
          style={{ background: '#FFF0F0', boxShadow: 'var(--shadow-clay-inset)' }}
        >
          Cerrar sesión
        </button>
      </ClayCard>
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
