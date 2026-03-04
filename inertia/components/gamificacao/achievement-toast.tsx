import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface AchievementToastProps {
  visible: boolean
  name: string
  description?: string
}

export function AchievementToast({ visible, name, description }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-2xl border border-gf-gold/40 bg-gradient-to-r from-gf-gold/20 to-gf-secondary-light px-5 py-3 shadow-lg dark:from-gf-gold-dark/20 dark:to-gf-navy"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-gf-gold/30 animate-[gf-sparkle_1.5s_ease-in-out_infinite]">
            <Trophy className="size-5 text-gf-gold-dark" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-gf-primary-dark dark:text-gf-primary-light">
              Conquista Desbloqueada!
            </p>
            <p className="font-body text-sm font-bold">{name}</p>
            {description && (
              <p className="font-body text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
