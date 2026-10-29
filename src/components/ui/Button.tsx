import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-royal text-white hover:bg-royal-hover disabled:bg-navy-100 disabled:text-faint',
  secondary: 'bg-white text-ink border border-line hover:bg-navy-50 disabled:text-faint',
  ghost: 'bg-transparent text-ink hover:bg-navy-50',
  danger: 'bg-danger-ink text-white hover:opacity-90',
  amber: 'bg-amber-ink text-white hover:opacity-90',
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed ${
        size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-sm'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
