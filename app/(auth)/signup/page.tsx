'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [closed, setClosed] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const res = await fetch('/api/registro-status')
      const data = await res.json()
      if (data.cerrado) {
        router.replace('/pin')
      } else {
        setClosed(false)
        setLoading(false)
      }
    }
    check()
  }, [router])

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  if (loading) return <LoadingScreen />

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-clay-bg">
      <div
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 flex flex-col items-center gap-6"
        style={{ boxShadow: 'var(--shadow-clay)' }}
      >
        <div className="text-6xl">🍉🍔</div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-clay-text">Eat&amp;Fit</h1>
          <p className="text-clay-gray-dark text-sm mt-1">Registra tus hábitos diarios</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-clay-gray rounded-2xl py-3 px-4 font-medium text-clay-text active:scale-95 transition-transform"
          style={{ boxShadow: 'var(--shadow-clay-sm)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <p className="text-xs text-clay-gray-dark text-center">
          Solo disponible para los 2 usuarios registrados
        </p>
      </div>
    </main>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-clay-bg">
      <div className="text-4xl animate-bounce">🍉</div>
    </div>
  )
}
