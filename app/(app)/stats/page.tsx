export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import StatsClient from './StatsClient'

export default async function StatsPage() {
  const session = await getSession()
  if (!session) redirect('/pin')

  const admin = createAdminClient()
  const { data: users } = await admin
    .from('usuarios')
    .select('id, nombre')
    .order('created_at')

  const partner = (users ?? []).find((u) => u.id !== session.userId) ?? null

  return (
    <StatsClient
      myUserId={session.userId}
      myNombre={session.nombre}
      partner={partner}
    />
  )
}
