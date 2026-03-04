import type { Position } from '../player/input-manager'

/** A zone on the map that the player can interact with. */
export interface InteractionZoneDef {
  /** Unique identifier for this zone. */
  id: string
  /** Label shown in the interaction prompt. */
  label: string
  /** Inertia route to navigate to on interaction. */
  href: string
  /** Center position in logical scene coordinates. */
  position: Position
  /** Activation radius in logical pixels. */
  radius: number
  /** Fill colour for the placeholder object sprite. */
  color: number
  /** Width of the placeholder object sprite. */
  width: number
  /** Height of the placeholder object sprite. */
  height: number
}

/** Full map definition for a scene. */
export interface MapDef {
  /** Logical width of the scene. */
  width: number
  /** Logical height of the scene. */
  height: number
  /** Initial player spawn position. */
  playerSpawn: Position
  /** All interaction zones in the map. */
  zones: InteractionZoneDef[]
}

// ─── Tilemap types (Phase 4) ───

/** A door tile that transitions to another scene. */
export interface DoorDef {
  /** X position in tile coordinates. */
  tileX: number
  /** Y position in tile coordinates. */
  tileY: number
  /** The scene this door leads to. */
  targetScene: 'overworld'
}

/** Tilemap data for indoor scenes. */
export interface TileMapData {
  /** Number of tiles wide. */
  width: number
  /** Number of tiles tall. */
  height: number
  /** Pixel size of each tile. */
  tileSize: number
  /** Tile layers (flat arrays, row-major order: index = y * width + x). */
  layers: {
    /** Ground/floor tiles. */
    ground: number[]
    /** Wall tiles (0 = passable, non-zero = wall). */
    walls: number[]
    /** Decorative object tiles (0 = empty). */
    objects: number[]
  }
  /** Door definitions for scene transitions. */
  doors: DoorDef[]
  /** Interaction zones inside the room (counters, etc.). */
  interactionZones: InteractionZoneDef[]
  /** Player spawn position in tile coordinates. */
  playerSpawn: { x: number; y: number }
}

/** Tile colour palette for placeholder rendering. */
export const TILE_COLORS: Record<number, number> = {
  0: 0x000000, // empty / transparent
  1: 0xe8d5b7, // ground - light beige floor
  2: 0x5c3a21, // wall - dark brown
  3: 0xc17d4f, // door - red-brown
  4: 0x8b5e3c, // counter - darker wood
  5: 0xa67b5b, // shelf - medium brown
  6: 0xd4a574, // decoration - accent (default)
}
