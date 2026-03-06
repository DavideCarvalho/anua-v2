import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { PromptType } from '../../engine/scenes/indoor-scene'

/** High-level state pushed from the PixiJS engine to React overlays. */
export interface RpgSceneState {
  ready: boolean
  nearbyZone: { id: string; label: string; href: string } | null
  promptType: PromptType
}

const DEFAULT_STATE: RpgSceneState = { ready: false, nearbyZone: null, promptType: null }

interface RpgSceneContextValue {
  state: RpgSceneState
  /** Called by the engine bridge to push state updates. */
  setState: (patch: Partial<RpgSceneState>) => void
}

const RpgSceneContext = createContext<RpgSceneContextValue>({
  state: DEFAULT_STATE,
  setState: () => {},
})

export function RpgSceneProvider({ children }: { children: ReactNode }) {
  const [state, _setState] = useState<RpgSceneState>(DEFAULT_STATE)

  const setState = useCallback((patch: Partial<RpgSceneState>) => {
    _setState((prev) => ({ ...prev, ...patch }))
  }, [])

  return <RpgSceneContext.Provider value={{ state, setState }}>{children}</RpgSceneContext.Provider>
}

export function useRpgSceneState(): RpgSceneState {
  return useContext(RpgSceneContext).state
}

export function useRpgSceneDispatch(): (patch: Partial<RpgSceneState>) => void {
  return useContext(RpgSceneContext).setState
}
