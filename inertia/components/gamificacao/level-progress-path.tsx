import { motion } from 'framer-motion'

interface LevelProgressPathProps {
  progress: number
  level: number
}

export function LevelProgressPath({ progress, level }: LevelProgressPathProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between font-body text-sm">
        <span className="text-muted-foreground">Nível {level}</span>
        <span className="font-display font-semibold text-gf-primary">{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gf-primary/10 dark:bg-gf-primary/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-gf-primary to-gf-primary-dark"
        />
      </div>
      <p className="font-body text-xs text-muted-foreground">
        {progress}% para o nível {level + 1}
      </p>
    </div>
  )
}
