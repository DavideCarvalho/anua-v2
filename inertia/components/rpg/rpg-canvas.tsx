import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameEngine, SceneState, EngineAction } from '../../engine/game'
import { RpgSceneProvider, useRpgSceneDispatch, useRpgSceneState } from './rpg-scene-context'
import { RpgHud } from './rpg-hud'
import { RpgInteractionPrompt } from './rpg-interaction-prompt'
import { RpgMochilaOverlay } from './rpg-mochila-overlay'
import { RpgCorreioOverlay } from './rpg-correio-overlay'
import { RpgGameMenu } from './rpg-game-menu'
import type { AvatarData } from '../../engine/types'

export type { AvatarData }

export interface RpgCanvasProps {
  /** Classes applied to the outer wrapper div. */
  className?: string
  /** Avatar customization (skin, hair, outfit, accessories) for the in-game sprite. */
  avatar?: AvatarData
  /** Gamification stats for the HUD overlay. */
  gamification?: {
    totalPoints: number
    currentLevel: number
    levelProgress: number
    streak: number
  }
}

/**
 * Themed loading screen shown while the engine initialises.
 * Pure React (no PixiJS) so it renders instantly.
 */
function RpgLoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-stone-900/60">
      {/* Wooden frame border */}
      <div className="relative flex flex-col items-center gap-4 rounded-lg border-4 border-amber-700/60 bg-amber-50/80 px-8 py-6 shadow-lg dark:border-amber-800/50 dark:bg-stone-800/80">
        {/* Corner nails (decorative) */}
        <div className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-600/50 dark:bg-amber-500/30" />
        <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-600/50 dark:bg-amber-500/30" />
        <div className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-amber-600/50 dark:bg-amber-500/30" />
        <div className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-600/50 dark:bg-amber-500/30" />

        {/* Title */}
        <span className="text-sm font-semibold tracking-wide text-amber-800 dark:text-amber-200">
          Ilha de Aventuras
        </span>

        {/* Animated loading dots */}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-600 dark:bg-amber-400"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-600 dark:bg-amber-400"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-600 dark:bg-amber-400"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Loading text */}
        <span className="text-xs text-amber-700/80 dark:text-amber-300/60">
          Preparando o mundo...
        </span>
      </div>
    </div>
  )
}

/**
 * Inner component that lives inside the RpgSceneProvider so it can use context.
 */
function RpgCanvasInner({ className, avatar, gamification }: RpgCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const dispatch = useRpgSceneDispatch()
  const { ready, nearbyZone } = useRpgSceneState()
  const [mochilaOpen, setMochilaOpen] = useState(false)
  const [correioOpen, setCorreioOpen] = useState(false)

  const handleStateChange = useCallback(
    (state: Partial<SceneState>) => {
      dispatch(state)
    },
    [dispatch]
  )

  const handleEngineAction = useCallback((action: EngineAction) => {
    engineRef.current?.handleAction(action)
  }, [])

  const handleOpenMailbox = useCallback(() => {
    setCorreioOpen(true)
  }, [])

  // Global "i" key opens mochila overlay from anywhere
  useEffect(() => {
    if (!ready) return

    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setMochilaOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ready])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const container = containerRef.current
      if (!container) return

      const { GameEngine } = await import('../../engine/game')

      if (cancelled) return

      const engine = new GameEngine({
        container,
        avatar,
        onSceneStateChange: handleStateChange,
      })

      engineRef.current = engine
      await engine.init()
    }

    boot()

    return () => {
      cancelled = true
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [handleStateChange, avatar])

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[200px] w-full overflow-hidden rounded-lg ${className ?? ''}`}
      aria-label="Game canvas"
    >
      {!ready && <RpgLoadingScreen />}

      {/* HUD overlay */}
      {ready && gamification && (
        <RpgHud
          points={gamification.totalPoints}
          level={gamification.currentLevel}
          streak={gamification.streak}
        />
      )}

      {/* Interaction prompt overlay */}
      {ready && (
        <RpgInteractionPrompt
          onEngineAction={handleEngineAction}
          onOpenMailbox={handleOpenMailbox}
          nearbyZoneId={nearbyZone?.id}
        />
      )}

      {/* In-game menu — quadradinhos no canto que abrem Mochila e Correio */}
      {ready && (
        <RpgGameMenu
          onOpenMochila={() => setMochilaOpen(true)}
          onOpenCorreio={() => setCorreioOpen(true)}
        />
      )}

      {/* Mochila and Correio overlays */}
      <RpgMochilaOverlay open={mochilaOpen} onOpenChange={setMochilaOpen} />
      <RpgCorreioOverlay open={correioOpen} onOpenChange={setCorreioOpen} />
    </div>
  )
}

/**
 * SSR-safe React wrapper around the PixiJS GameEngine.
 *
 * The engine module is imported dynamically inside a `useEffect` so that
 * PixiJS (which depends on browser APIs) is never evaluated during
 * server-side rendering.
 *
 * Includes HUD and interaction prompt overlays positioned over the canvas.
 */
export function RpgCanvas(props: RpgCanvasProps) {
  return (
    <RpgSceneProvider>
      <RpgCanvasInner {...props} />
    </RpgSceneProvider>
  )
}
