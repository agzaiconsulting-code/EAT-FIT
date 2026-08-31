import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes') // YYYY-MM
  const userId = searchParams.get('userId') ?? session.userId

  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ error: 'Parámetro mes inválido' }, { status: 400 })
  }

  const [year, month] = mes.split('-').map(Number)
  const desde = `${year}-${String(month).padStart(2, '0')}-01`
  const hasta = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('registros_diarios')
    .select('id, fecha, comida, gimnasio, objetivo, deportes_dia(id, tipo, kms)')
    .eq('usuario_id', userId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { fecha, comida, gimnasio, objetivo, deportes } = body

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  if (fecha < today) {
    return NextResponse.json({ error: 'No se pueden editar días pasados' }, { status: 403 })
  }

  const isFuture = fecha > today
  const admin = createAdminClient()

  // For future days, only objetivo is settable
  const registroData: Record<string, unknown> = {
    usuario_id: session.userId,
    fecha,
    objetivo: Boolean(objetivo),
  }

  if (!isFuture) {
    registroData.comida = comida ?? null
    registroData.gimnasio = Boolean(gimnasio)
  }

  const { data: registro, error: upsertError } = await admin
    .from('registros_diarios')
    .upsert(registroData, { onConflict: 'usuario_id,fecha' })
    .select('id')
    .single()

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  if (!isFuture && registro) {
    // Replace deportes
    await admin.from('deportes_dia').delete().eq('registro_id', registro.id)

    if (Array.isArray(deportes) && deportes.length > 0) {
      const deportesRows = deportes.map((d: { tipo: string; kms?: number }) => ({
        registro_id: registro.id,
        tipo: d.tipo,
        kms: d.tipo === 'Correr' ? (d.kms ?? null) : null,
      }))
      await admin.from('deportes_dia').insert(deportesRows)
    }
  }

  return NextResponse.json({ ok: true })
}
