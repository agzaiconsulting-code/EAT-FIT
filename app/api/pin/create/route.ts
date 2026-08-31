import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPin, verifyPin } from '@/lib/pin'
import { createSession, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  const { pin } = await request.json()

  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'El PIN debe tener 4 dígitos' }, { status: 400 })
  }

  // Verify Supabase OAuth session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Check if registration is still open
  const { data: config } = await admin
    .from('app_config')
    .select('registro_cerrado')
    .eq('id', 1)
    .single()

  if (config?.registro_cerrado) {
    return NextResponse.json({ error: 'Registro cerrado' }, { status: 403 })
  }

  // Check PIN uniqueness against existing users
  const { data: existingUsers } = await admin
    .from('usuarios')
    .select('pin_hash')
    .not('id', 'eq', user.id)
    .not('pin_hash', 'is', null)

  for (const u of existingUsers ?? []) {
    const collision = await verifyPin(pin, u.pin_hash!)
    if (collision) {
      return NextResponse.json({ error: 'Este PIN ya está en uso' }, { status: 409 })
    }
  }

  const pinHash = await hashPin(pin)

  // Upsert usuario and set pin_hash
  await admin.from('usuarios').upsert({
    id: user.id,
    email: user.email!,
    nombre: user.user_metadata?.full_name ?? user.email!.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url ?? null,
    pin_hash: pinHash,
  })

  // Fetch nombre (may have just been upserted)
  const { data: userRow } = await admin
    .from('usuarios')
    .select('nombre, avatar_url')
    .eq('id', user.id)
    .single()

  const token = await createSession({
    userId: user.id,
    email: user.email!,
    nombre: userRow?.nombre ?? user.email!,
    avatarUrl: userRow?.avatar_url ?? null,
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set(sessionCookieOptions(token))
  return response
}
