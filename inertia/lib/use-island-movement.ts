import { useCallback, useEffect, useRef, useState } from 'react'

export interface InteractionZone {
  id: string
  x: number
  y: number
  radius: number
  href: string
  label: string
}

interface Position {
  x: number
  y: number
}

interface UseIslandMovementConfig {
  zones: InteractionZone[]
  initialPosition: Position
  speed?: number
  onInteract?: (zone: InteractionZone) => void
}

interface UseIslandMovementReturn {
  position: Position
  direction: 'left' | 'right'
  isMoving: boolean
  nearbyZone: InteractionZone | null
  handleSceneClick: (e: React.MouseEvent<HTMLElement>) => void
}

const ISLAND_BOUNDARY: Position[] = [
  { x: 88, y: 108 },
  { x: 100, y: 88 },
  { x: 140, y: 60 },
  { x: 200, y: 53 },
  { x: 260, y: 55 },
  { x: 300, y: 72 },
  { x: 322, y: 100 },
  { x: 325, y: 120 },
  { x: 322, y: 150 },
  { x: 310, y: 185 },
  { x: 270, y: 210 },
  { x: 230, y: 225 },
  { x: 170, y: 232 },
  { x: 130, y: 222 },
  { x: 95, y: 205 },
  { x: 68, y: 175 },
  { x: 63, y: 150 },
  { x: 65, y: 125 },
]

function isPointInPolygon(point: Position, polygon: Position[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const SCENE_WIDTH = 400
const SCENE_HEIGHT = 300
const DEFAULT_SPEED = 120
const TAP_ARRIVAL_THRESHOLD = 4

export function useIslandMovement(config: UseIslandMovementConfig): UseIslandMovementReturn {
  const { zones, initialPosition, speed = DEFAULT_SPEED, onInteract } = config

  const [position, setPosition] = useState<Position>(initialPosition)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isMoving, setIsMoving] = useState(false)
  const [nearbyZone, setNearbyZone] = useState<InteractionZone | null>(null)

  const posRef = useRef<Position>(initialPosition)
  const keysRef = useRef<Set<string>>(new Set())
  const tapTargetRef = useRef<Position | null>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const pausedRef = useRef(false)

  // Keyboard input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysRef.current.add(key)
        tapTargetRef.current = null // keyboard cancels tap
        e.preventDefault()
      }

      if ((key === 'enter' || key === ' ') && nearbyZone) {
        e.preventDefault()
        onInteract?.(nearbyZone)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [nearbyZone, onInteract])

  // Visibility pause
  useEffect(() => {
    function onVisibility() {
      pausedRef.current = document.hidden
      if (!document.hidden) {
        lastTimeRef.current = 0
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Game loop
  useEffect(() => {
    function tick(time: number) {
      rafRef.current = requestAnimationFrame(tick)

      if (pausedRef.current) return
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time
        return
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05) // cap at 50ms
      lastTimeRef.current = time

      const keys = keysRef.current
      let dx = 0
      let dy = 0

      // Keyboard movement (priority over tap)
      const hasKeyboard = keys.size > 0
      if (hasKeyboard) {
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1
        if (keys.has('d') || keys.has('arrowright')) dx += 1
        if (keys.has('w') || keys.has('arrowup')) dy -= 1
        if (keys.has('s') || keys.has('arrowdown')) dy += 1
      } else if (tapTargetRef.current) {
        const target = tapTargetRef.current
        const toX = target.x - posRef.current.x
        const toY = target.y - posRef.current.y
        const dist = Math.sqrt(toX * toX + toY * toY)

        if (dist < TAP_ARRIVAL_THRESHOLD) {
          tapTargetRef.current = null
        } else {
          dx = toX / dist
          dy = toY / dist
        }
      }

      // Normalize diagonal
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0) {
        dx /= len
        dy /= len
      }

      const moving = len > 0
      const newX = posRef.current.x + dx * speed * dt
      const newY = posRef.current.y + dy * speed * dt

      if (moving) {
        // Try full move
        let finalPos: Position = { x: newX, y: newY }
        if (!isPointInPolygon(finalPos, ISLAND_BOUNDARY)) {
          // Wall slide: try X only
          const slideX: Position = { x: newX, y: posRef.current.y }
          if (isPointInPolygon(slideX, ISLAND_BOUNDARY)) {
            finalPos = slideX
          } else {
            // Try Y only
            const slideY: Position = { x: posRef.current.x, y: newY }
            if (isPointInPolygon(slideY, ISLAND_BOUNDARY)) {
              finalPos = slideY
            } else {
              finalPos = posRef.current
            }
          }
        }

        posRef.current = finalPos
        setPosition(finalPos)
        setDirection(dx > 0 ? 'right' : dx < 0 ? 'left' : (prev) => prev)
        setIsMoving(true)
      } else {
        setIsMoving(false)
      }

      // Proximity check
      let closest: InteractionZone | null = null
      let closestDist = Infinity
      for (const zone of zones) {
        const zx = zone.x - posRef.current.x
        const zy = zone.y - posRef.current.y
        const d = Math.sqrt(zx * zx + zy * zy)
        if (d < zone.radius && d < closestDist) {
          closest = zone
          closestDist = d
        }
      }
      setNearbyZone(closest)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [zones, speed])

  // Tap-to-walk handler
  const handleSceneClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * SCENE_WIDTH
    const y = ((e.clientY - rect.top) / rect.height) * SCENE_HEIGHT

    if (isPointInPolygon({ x, y }, ISLAND_BOUNDARY)) {
      tapTargetRef.current = { x, y }
    }
  }, [])

  return { position, direction, isMoving, nearbyZone, handleSceneClick }
}
