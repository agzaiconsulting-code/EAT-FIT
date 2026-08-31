import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(`${origin}/signup`)

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) return NextResponse.redirect(`${origin}/signup`)

  const admin = createAdminClient()

  // Check if registration is closed
  const { data: config } = await admin
    .from('app_config')
    .select('registro_cerrado')
    .eq('id', 1)
    .single()

  const { data: existing } = await admin
    .from('usuarios')
    .select('id, pin_hash')
    .eq('id', user.id)
    .single()

  if (!existing) {
    if (config?.registro_cerrado) {
      // Registro cerrado — no podemos admitir a nadie más
      return NextResponse.redirect(`${origin}/pin`)
    }
    // Crear usuario nuevo
    await admin.from('usuarios').insert({
      id: user.id,
      email: user.email!,
      nombre: user.user_metadata?.full_name ?? user.email!.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url ?? null,
    })
    return NextResponse.redirect(`${origin}/setup-pin`)
  }

  if (!existing.pin_hash) {
    return NextResponse.redirect(`${origin}/setup-pin`)
  }

  // Ya tiene PIN — usar flujo diario
  return NextResponse.redirect(`${origin}/pin`)
}
