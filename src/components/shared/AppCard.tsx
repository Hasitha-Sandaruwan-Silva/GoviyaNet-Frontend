import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardHover } from '@/lib/animations'

interface AppCardProps {
  variant?: 'default' | 'gradient' | 'glass'
  hover?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  default: 'bg-white border border-slate-200/80 shadow-soft',
  gradient: 'bg-gradient-to-br from-brand-50 to-white border border-brand-100 shadow-soft',
  glass: 'glass border-white/40',
}

export function AppCard({
  variant = 'default',
  hover = false,
  className,
  children,
}: AppCardProps) {
  const classes = cn(
    'rounded-2xl p-6 transition-shadow',
    hover && 'hover:shadow-md',
    variantStyles[variant],
    className,
  )

  if (hover) {
    return (
      <motion.div className={classes} {...cardHover}>
        {children}
      </motion.div>
    )
  }

  return <div className={classes}>{children}</div>
}
