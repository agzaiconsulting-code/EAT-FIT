'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

const BarChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const TABS = [
  { href: '/home', icon: CalendarIcon, label: 'Inicio' },
  { href: '/stats', icon: BarChartIcon, label: 'Stats' },
  { href: '/settings', icon: UserIcon, label: 'Ajustes' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--c-surface)',
        borderTop: '1px solid var(--c-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 56,
        zIndex: 50,
      }}
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '4px 20px',
              color: active ? 'var(--c-accent)' : 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
            {active && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--c-accent)',
                }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
