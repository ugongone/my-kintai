type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-orange-100 text-orange-700',
  danger: 'bg-red-100 text-red-700',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantStyles[variant]}
      `}
    >
      {children}
    </span>
  )
}
