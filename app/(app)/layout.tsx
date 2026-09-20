export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/pin')

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'fixed', top: -120, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 80, left: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 56, position: 'relative', zIndex: 1 }}>{children}</main>
      <BottomNav />
    </div>
  )
}
