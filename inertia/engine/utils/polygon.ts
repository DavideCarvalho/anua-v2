import type { Position } from '../player/input-manager'

/**
 * Ray-casting point-in-polygon test.
 *
 * Returns true if the given point lies inside the polygon defined by the
 * ordered array of vertices.
 */
export function isPointInPolygon(point: Position, polygon: Position[]): boolean {
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

/** Island boundary polygon -- 18 vertices matching the SVG island shape. */
export const ISLAND_BOUNDARY: Position[] = [
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
