'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/home', icon: '📅', label: 'Inicio' },
  { href: '/stats', icon: '📊', label: 'Stats' },
  { href: '/settings', icon: '⚙️', label: 'Ajustes' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white flex justify-around items-center py-3 px-4"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', borderRadius: '1.5rem 1.5rem 0 0' }}
    >
      {TABS.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all ${
              active ? 'bg-clay-yellow' : ''
            }`}
            style={active ? { boxShadow: 'var(--shadow-clay-sm)' } : {}}
          >
            <span className="text-xl">{icon}</span>
            <span className={`text-[10px] font-medium ${active ? 'text-clay-text' : 'text-clay-gray-dark'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
