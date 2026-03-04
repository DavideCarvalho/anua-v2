import type { Position } from '../player/input-manager'
import type { InteractionZoneDef } from '../maps/map-types'

/** The zone that is currently within interaction range, or null. */
export type NearbyZone = { id: string; label: string; href: string } | null

export type OnNearbyZoneChange = (zone: NearbyZone) => void

/**
 * Checks player proximity to interaction zones each tick and notifies
 * when the nearest zone changes.
 */
export class InteractionManager {
  private zones: InteractionZoneDef[]
  private currentZone: NearbyZone = null
  private onChange: OnNearbyZoneChange

  constructor(zones: InteractionZoneDef[], onChange: OnNearbyZoneChange) {
    this.zones = zones
    this.onChange = onChange
  }

  /**
   * Call every frame with the player's current position.
   * Determines which zone (if any) the player is close enough to interact with
   * and fires the callback when it changes.
   */
  update(playerPos: Position): void {
    let closest: InteractionZoneDef | null = null
    let closestDist = Infinity

    for (const zone of this.zones) {
      const dx = playerPos.x - zone.position.x
      const dy = playerPos.y - zone.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < zone.radius && dist < closestDist) {
        closest = zone
        closestDist = dist
      }
    }

    const newZone: NearbyZone = closest
      ? { id: closest.id, label: closest.label, href: closest.href }
      : null

    // Only fire callback when the zone actually changes
    if (this.currentZone?.id !== newZone?.id) {
      this.currentZone = newZone
      this.onChange(newZone)
    }
  }

  /** Get the currently active nearby zone. */
  getNearbyZone(): NearbyZone {
    return this.currentZone
  }

  destroy(): void {
    this.currentZone = null
  }
}
