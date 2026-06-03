import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (current) =>
    `${prefix}${Math.round(current).toLocaleString('en-LK')}${suffix}`,
  )
  const [text, setText] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
    const unsubscribe = display.on('change', (latest) => setText(latest))
    return unsubscribe
  }, [value, spring, display, prefix, suffix])

  return <motion.span className={className}>{text}</motion.span>
}
