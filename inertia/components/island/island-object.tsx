import { motion } from 'framer-motion'
import { objectPop } from '../../lib/gamified-animations'

interface IslandObjectProps {
  children: React.ReactNode
  label: string
  position: { top: string; left: string }
  badge?: React.ReactNode
  isActive?: boolean
}

export function IslandObject({ children, label, position, badge, isActive }: IslandObjectProps) {
  return (
    <motion.div
      variants={objectPop}
      className="absolute"
      style={{ top: position.top, left: position.left, zIndex: 10 }}
    >
      <div className="relative">
        <motion.div
          animate={
            isActive
              ? { scale: 1.1 }
              : { scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={isActive ? 'drop-shadow-[0_0_12px_rgba(13,148,136,0.4)]' : ''}
        >
          {/* Subtle idle pulse */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>

          {/* Badge (e.g. cart count) */}
          {badge && (
            <div className="absolute -right-1 -top-1 z-10">
              {badge}
            </div>
          )}

          {/* Label */}
          <div
            className={`pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gf-navy/80 px-2.5 py-0.5 font-display text-[11px] font-semibold text-white transition-opacity dark:bg-white/90 dark:text-gf-navy sm:text-xs ${
              isActive ? 'opacity-100' : 'opacity-0 max-sm:opacity-100'
            }`}
          >
            {label}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
