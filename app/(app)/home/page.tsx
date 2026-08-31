export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const session = await getSession()
  if (!session) redirect('/pin')

  const admin = createAdminClient()
  const { data: users } = await admin
    .from('usuarios')
    .select('id, nombre, avatar_url')
    .order('created_at')

  const partner = (users ?? []).find((u) => u.id !== session.userId) ?? null

  return (
    <CalendarClient
      myUserId={session.userId}
      myNombre={session.nombre}
      partner={partner}
    />
  )
}
