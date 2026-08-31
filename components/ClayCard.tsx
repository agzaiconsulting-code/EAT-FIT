import { ReactNode } from 'react'

interface ClayCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ClayCard({ children, className = '', style }: ClayCardProps) {
  return (
    <div
      className={`bg-white rounded-[1.75rem] ${className}`}
      style={{ boxShadow: 'var(--shadow-clay)', ...style }}
    >
      {children}
    </div>
  )
}
