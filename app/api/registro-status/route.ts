import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('app_config')
    .select('registro_cerrado')
    .eq('id', 1)
    .single()

  return NextResponse.json({ cerrado: data?.registro_cerrado ?? false })
}
