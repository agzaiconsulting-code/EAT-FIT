import { ReactNode } from 'react'

interface ClayCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ClayCard({ children, className = '', style }: ClayCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
