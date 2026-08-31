export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'

// Gateway: authenticated → /home, unauthenticated → /pin or /signup
export default async function RootPage() {
  const session = await getSession()

  if (session) {
    redirect('/home')
  }

  const admin = createAdminClient()
  const { data: config } = await admin
    .from('app_config')
    .select('registro_cerrado')
    .eq('id', 1)
    .maybeSingle()

  if (config?.registro_cerrado) {
    redirect('/pin')
  }

  redirect('/signup')
}
