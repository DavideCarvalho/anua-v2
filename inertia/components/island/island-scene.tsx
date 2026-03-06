import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { router } from '@inertiajs/react'
import { IslandGround } from './island-ground'
import { IslandDecorations } from './island-decorations'
import { IslandTrail } from './island-trail'
import { IslandAvatar } from './island-avatar'
import { IslandStatsSign } from './island-stats-sign'
import { IslandObject } from './island-object'
import { IslandInteractionPrompt } from './island-interaction-prompt'
import { TreasureChest } from './objects/treasure-chest'
import { MarketStall } from './objects/market-stall'
import { Mailbox } from './objects/mailbox'
import { islandEntrance, staggerContainer } from '../../lib/gamified-animations'
import { useIslandMovement, type InteractionZone } from '../../lib/use-island-movement'

const INTERACTION_ZONES: InteractionZone[] = [
  {
    id: 'treasure',
    x: 80,
    y: 80,
    radius: 40,
    href: '/aluno/loja/pontos',
    label: 'Baú de Tesouros',
  },
  { id: 'market', x: 300, y: 70, radius: 40, href: '/aluno/loja', label: 'Mercadinho' },
  { id: 'mailbox', x: 310, y: 195, radius: 40, href: '/aluno/loja/pedidos', label: 'Correio' },
]

interface IslandSceneProps {
  avatar: {
    skinTone: string
    hairStyle: string
    hairColor: string
    outfit: string
    accessories: string[]
  }
  gamification: {
    totalPoints: number
    currentLevel: number
    levelProgress: number
    streak: number
  }
}

export function IslandScene({ avatar, gamification }: IslandSceneProps) {
  const handleInteract = useCallback((zone: InteractionZone) => {
    router.visit(zone.href)
  }, [])

  const { position, direction, isMoving, nearbyZone, handleSceneClick } = useIslandMovement({
    zones: INTERACTION_ZONES,
    initialPosition: { x: 200, y: 150 },
    onInteract: handleInteract,
  })

  return (
    <motion.div
      variants={islandEntrance}
      initial="hidden"
      animate="show"
      className="relative mx-auto w-full max-w-[600px]"
    >
      {/* Dark mode starry background */}
      <div
        className="absolute -inset-4 hidden rounded-2xl dark:block"
        style={{
          background:
            'radial-gradient(1px 1px at 20% 30%, white 50%, transparent 100%), radial-gradient(1px 1px at 70% 60%, white 50%, transparent 100%), radial-gradient(1px 1px at 40% 80%, white 50%, transparent 100%), radial-gradient(1px 1px at 80% 20%, white 50%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      {/* Scene container with aspect ratio */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative aspect-[4/3] w-full origin-center scale-[0.7] sm:scale-[0.85] lg:scale-100"
        onClick={handleSceneClick}
      >
        {/* Layer 1: Ground */}
        <IslandGround />

        {/* Layer 2: Decorations */}
        <IslandDecorations />

        {/* Layer 3: Trail */}
        <IslandTrail progress={gamification.levelProgress} level={gamification.currentLevel} />

        {/* Layer 4: Interactive objects */}
        <IslandObject
          label="Baú de Tesouros"
          position={{ top: '18%', left: '12%' }}
          isActive={nearbyZone?.id === 'treasure'}
        >
          <TreasureChest />
        </IslandObject>

        <IslandObject
          label="Mercadinho"
          position={{ top: '15%', left: '68%' }}
          isActive={nearbyZone?.id === 'market'}
        >
          <MarketStall />
        </IslandObject>

        <IslandObject
          label="Correio"
          position={{ top: '60%', left: '72%' }}
          isActive={nearbyZone?.id === 'mailbox'}
        >
          <Mailbox />
        </IslandObject>

        {/* Layer 5: Avatar */}
        <IslandAvatar
          skinTone={avatar.skinTone}
          hairStyle={avatar.hairStyle}
          hairColor={avatar.hairColor}
          outfit={avatar.outfit}
          accessories={avatar.accessories}
          position={position}
          direction={direction}
          isMoving={isMoving}
        />

        {/* Layer 6: Interaction prompt */}
        <AnimatePresence>
          {nearbyZone && (
            <IslandInteractionPrompt
              key={nearbyZone.id}
              zone={nearbyZone}
              onInteract={() => handleInteract(nearbyZone)}
            />
          )}
        </AnimatePresence>

        {/* Layer 7: Stats sign */}
        <IslandStatsSign
          points={gamification.totalPoints}
          level={gamification.currentLevel}
          streak={gamification.streak}
        />
      </motion.div>
    </motion.div>
  )
}
