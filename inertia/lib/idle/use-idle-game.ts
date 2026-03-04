import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  buyUpgrade,
  canBuyUpgrade,
  click,
  createInitialIdleState,
  tick,
  type IdleState,
  type IdleUpgradeId,
} from './idle-core'

export function useIdleGame() {
  const [state, setState] = useState<IdleState>(() => createInitialIdleState())
  const [clickPulse, setClickPulse] = useState(0)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const loop = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now
      }

      const deltaSeconds = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      if (deltaSeconds > 0) {
        setState((prev) => tick(prev, Math.min(deltaSeconds, 0.25)))
      }

      frameRef.current = window.requestAnimationFrame(loop)
    }

    frameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = null
      lastTimeRef.current = null
    }
  }, [])

  const onClick = useCallback(() => {
    setState((prev) => click(prev))
    setClickPulse((prev) => prev + 1)
  }, [])

  const onBuyUpgrade = useCallback((id: IdleUpgradeId) => {
    setState((prev) => buyUpgrade(prev, id))
  }, [])

  const actions = useMemo(
    () => ({
      onClick,
      onBuyUpgrade,
      canBuy: (id: IdleUpgradeId) => canBuyUpgrade(state, id),
    }),
    [onClick, onBuyUpgrade, state]
  )

  return { state, actions, clickPulse }
}
