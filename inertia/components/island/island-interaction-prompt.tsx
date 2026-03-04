import { motion } from 'framer-motion'
import type { InteractionZone } from '../../lib/use-island-movement'
import { promptFade } from '../../lib/gamified-animations'

interface IslandInteractionPromptProps {
  zone: InteractionZone
  onInteract: () => void
}

export function IslandInteractionPrompt({ zone, onInteract }: IslandInteractionPromptProps) {
  const leftPct = (zone.x / 400) * 100
  const topPct = (zone.y / 300) * 100

  return (
    <motion.div
      variants={promptFade}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="absolute z-30"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: 'translate(-50%, -130%)',
      }}
    >
      <div className="relative">
        {/* Sign post */}
        <div className="absolute left-1/2 top-full h-3 w-1.5 -translate-x-1/2 rounded-b bg-[#8B5E3C] dark:bg-[#6B3F1F]" />

        {/* Wooden sign board */}
        <div className="flex flex-col items-center gap-0.5 rounded-lg border-2 border-[#8B5E3C] bg-[#DEB887] px-3 py-1.5 shadow-[2px_2px_0px_#6B3F1F] dark:border-[#6B3F1F] dark:bg-[#8B5E3C]">
          <span className="font-display text-[10px] font-bold text-[#5C3A1E] dark:text-[#DEB887] sm:text-xs">
            {zone.label}
          </span>

          {/* Desktop: keyboard hint */}
          <span className="hidden font-display text-[9px] text-[#8B5E3C]/70 dark:text-[#DEB887]/70 sm:text-[10px] [@media(pointer:fine)]:block">
            Pressione [Enter]
          </span>

          {/* Mobile: tap button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onInteract()
            }}
            className="rounded bg-gf-primary/90 px-2 py-0.5 font-display text-[10px] font-semibold text-white active:bg-gf-primary [@media(pointer:fine)]:hidden"
          >
            Entrar
          </button>
        </div>
      </div>
    </motion.div>
  )
}
