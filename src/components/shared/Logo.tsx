import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { icon: 'h-6 w-6', text: 'text-lg' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl' },
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = sizeMap[size]

  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2', className)}>
      <motion.div
        whileHover={{ rotate: 12, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="flex items-center justify-center rounded-xl bg-brand-500 p-1.5 text-white shadow-sm"
      >
        <Leaf className={sizes.icon} aria-hidden />
      </motion.div>
      {showText ? (
        <span className={cn('font-display font-bold tracking-tight text-brand-700', sizes.text)}>
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  )
}
