import { useEffect, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { useRpgSceneState } from './rpg-scene-context'

interface RpgInteractionPromptProps {
  /** Callback for engine-handled actions (enter building, exit building). */
  onEngineAction?: (action: 'enter' | 'exit') => void
  /** Callback when mailbox is interacted — opens overlay instead of room. */
  onOpenMailbox?: () => void
  /** Current nearby zone ID (to detect mailbox). */
  nearbyZoneId?: string | null
}

/**
 * Interaction prompt overlay that appears when the player is near an
 * interactive zone.
 *
 * Prompt types:
 * - 'enter': "Entrar em [label]?" — triggers engine pushScene (not router.visit)
 * - 'interact': "[label]" — triggers router.visit(href)
 * - 'exit': "Sair" — triggers engine popScene (not router.visit)
 *
 * Desktop: shows keyboard hint and listens for Enter/Space
 * Mobile: shows a tap button
 */
export function RpgInteractionPrompt({
  onEngineAction,
  onOpenMailbox,
  nearbyZoneId,
}: RpgInteractionPromptProps) {
  const { nearbyZone, promptType } = useRpgSceneState()

  const handleInteraction = useCallback(() => {
    if (!nearbyZone || !promptType) return

    if (promptType === 'enter') {
      if (nearbyZoneId === 'mailbox') {
        onOpenMailbox?.()
      } else {
        onEngineAction?.('enter')
      }
    } else if (promptType === 'exit') {
      onEngineAction?.('exit')
    } else if (promptType === 'interact') {
      router.visit(nearbyZone.href)
    }
  }, [nearbyZone, promptType, nearbyZoneId, onEngineAction, onOpenMailbox])

  // Listen for Enter/Space on desktop
  useEffect(() => {
    if (!nearbyZone || !promptType) return

    function handleKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleInteraction()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nearbyZone, promptType, handleInteraction])

  if (!nearbyZone || !promptType) return null

  // Determine display text based on prompt type
  let label: string
  let buttonText: string
  let hintText: string

  switch (promptType) {
    case 'enter':
      label =
        nearbyZoneId === 'mailbox'
          ? 'Abrir Correio?'
          : `Entrar em ${nearbyZone.label}?`
      buttonText = nearbyZoneId === 'mailbox' ? 'Abrir' : 'Entrar'
      hintText = 'Pressione [Enter]'
      break
    case 'exit':
      label = 'Sair'
      buttonText = 'Sair'
      hintText = 'Pressione [Enter]'
      break
    case 'interact':
      label = nearbyZone.label
      buttonText = 'Interagir'
      hintText = 'Pressione [Enter]'
      break
    default:
      return null
  }

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: '6%', zIndex: 30 }}
    >
      <div className="relative">
        {/* Wooden sign board */}
        <div className="flex flex-col items-center gap-0.5 rounded-lg border-2 border-[#8B5E3C] bg-[#DEB887] px-3 py-1.5 shadow-[2px_2px_0px_#6B3F1F] dark:border-[#6B3F1F] dark:bg-[#8B5E3C]">
          <span className="font-display text-[10px] font-bold text-[#5C3A1E] dark:text-[#DEB887] sm:text-xs">
            {label}
          </span>

          {/* Desktop: keyboard hint */}
          <span className="hidden font-display text-[9px] text-[#8B5E3C]/70 dark:text-[#DEB887]/70 sm:text-[10px] [@media(pointer:fine)]:block">
            {hintText}
          </span>

          {/* Mobile: tap button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleInteraction()
            }}
            className="rounded bg-gf-primary/90 px-2 py-0.5 font-display text-[10px] font-semibold text-white active:bg-gf-primary [@media(pointer:fine)]:hidden"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
