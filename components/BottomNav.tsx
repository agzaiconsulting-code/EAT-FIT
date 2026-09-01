'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="14" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <line x1="6" y1="2" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14" y1="2" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="11" width="3" height="3" fill="currentColor" />
    <rect x="9" y="11" width="3" height="3" fill="currentColor" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="4" height="8" fill="currentColor" />
    <rect x="8" y="6" width="4" height="12" fill="currentColor" />
    <rect x="14" y="2" width="4" height="16" fill="currentColor" />
  </svg>
)

const SlidersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="3" width="4" height="4" fill="var(--c-bg)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="8" width="4" height="4" fill="var(--c-bg)" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7" y="13" width="4" height="4" fill="var(--c-bg)" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const TABS = [
  { href: '/home', icon: CalendarIcon, label: 'Inicio' },
  { href: '/stats', icon: BarChartIcon, label: 'Stats' },
  { href: '/settings', icon: SlidersIcon, label: 'Ajustes' },
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
        background: 'var(--c-bg)',
        borderTop: '1px solid var(--c-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 48,
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
              gap: 2,
              padding: '4px 16px',
              color: active ? 'var(--c-accent)' : 'var(--c-dim)',
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: -1,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  background: 'var(--c-accent)',
                }}
              />
            )}
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
