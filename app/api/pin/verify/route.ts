import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPin } from '@/lib/pin'
import { createSession, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  const { pin } = await request.json()

  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: users } = await admin
    .from('usuarios')
    .select('id, email, nombre, avatar_url, pin_hash')
    .not('pin_hash', 'is', null)

  if (!users || users.length === 0) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  for (const user of users) {
    const match = await verifyPin(pin, user.pin_hash!)
    if (match) {
      const token = await createSession({
        userId: user.id,
        email: user.email,
        nombre: user.nombre,
        avatarUrl: user.avatar_url,
      })
      const response = NextResponse.json({ ok: true, nombre: user.nombre })
      response.cookies.set(sessionCookieOptions(token))
      return response
    }
  }

  return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
}
