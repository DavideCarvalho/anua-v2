import { motion } from 'framer-motion'
import { Link } from '@adonisjs/inertia/react'
import { cn } from '../../lib/utils'
import { fadeUp } from '../../lib/gamified-animations'

interface NavigationHotspotProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient: string
  badge?: React.ReactNode
}

export function NavigationHotspot({
  title,
  description,
  icon,
  href,
  gradient,
  badge,
}: NavigationHotspotProps) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={href} className="block">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative overflow-hidden rounded-2xl p-5 shadow-md transition-shadow hover:shadow-xl',
            gradient
          )}
        >
          {badge && (
            <div className="absolute right-3 top-3">{badge}</div>
          )}
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur-sm dark:bg-black/20">
            {icon}
          </div>
          <h3 className="font-display text-lg font-bold text-white drop-shadow-sm">
            {title}
          </h3>
          <p className="font-body text-sm text-white/80">{description}</p>
        </motion.div>
      </Link>
    </motion.div>
  )
}
