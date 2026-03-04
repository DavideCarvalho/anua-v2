import { motion } from 'framer-motion'
import { DiceBearAvatar } from '../avatar/dicebear-avatar'

interface IslandAvatarProps {
  skinTone: string
  hairStyle: string
  hairColor: string
  outfit: string
  accessories: string[]
  position: { x: number; y: number }
  direction: 'left' | 'right'
  isMoving: boolean
}

export function IslandAvatar({
  skinTone,
  hairStyle,
  hairColor,
  outfit,
  accessories,
  position,
  direction,
  isMoving,
}: IslandAvatarProps) {
  return (
    <div
      className="absolute"
      style={{
        left: `${(position.x / 400) * 100}%`,
        top: `${(position.y / 300) * 100}%`,
        transform: `translate(-50%, -50%) scaleX(${direction === 'left' ? -1 : 1})`,
        zIndex: 20,
      }}
    >
      <motion.div
        animate={
          isMoving
            ? { y: [0, -3, 0] }
            : { y: 0 }
        }
        transition={
          isMoving
            ? { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        className="relative"
      >
        {/* Avatar shadow on ground */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <div className="h-3 w-16 rounded-full bg-black/10 dark:bg-black/20" />
        </div>

        {/* Avatar ring */}
        <div className="rounded-full border-[3px] border-gf-primary/25 p-1.5 dark:border-gf-primary/35">
          <DiceBearAvatar
            skinTone={skinTone}
            hairStyle={hairStyle}
            hairColor={hairColor}
            outfit={outfit}
            accessories={accessories}
            variant="default"
            style="pixel-art"
          />
        </div>
      </motion.div>
    </div>
  )
}
