# Overworld Ground Village Design (Cute Fantasy)

## Context

- Scope: `/aluno` overworld ground only (water, beach/coast, grass, path).
- Goal: visual language close to the reference GIF (cute fantasy village), replacing the current blocky/flat floor look.
- Constraint: this feature is early and can be redesigned from zero; backward visual compatibility is not required.
- Existing logical tile IDs remain practical and simple:
  - `1` grass (walkable)
  - `2` water (blocked)
  - `3` path (walkable)

## Visual Intent

- Build a readable, organic island silhouette instead of a rectangular land mass.
- Keep coastline continuous and natural: no random beach shards in inner grass.
- Create internal rhythm on grass using controlled variation zones (not per-tile noise chaos).
- Give the village a believable circulation pattern with a plaza-like center and curved branches.

## Ground Architecture

### 1) Organic Island Mask

- Generate a boolean land mask first (`land` vs `water`) over the 40x25 grid.
- Shape is produced by combining:
  - an ellipse-like base footprint,
  - low-frequency deterministic noise/jitter,
  - 2-3 intentional coastal inlets to avoid symmetry.
- Post-process for cleanup:
  - remove tiny isolated single-cell artifacts,
  - enforce one connected main land mass.

### 2) Region Classification for Grass Variety

- Compute distance-to-coast map over land cells.
- Classify each land tile into one of three regions:
  - `core` (village center),
  - `transition`,
  - `edge` (near coast).
- Region is used for controlled visual variation (density, grouping, and texture picks), not for gameplay rules.

### 3) Village Path Network (Organic)

- Start with anchors:
  - spawn hub,
  - treasure zone,
  - market zone,
  - mailbox zone.
- Build network with:
  - one gently curved primary road,
  - a compact central plaza area around spawn,
  - curved branches from hub to each anchor.
- Width rules:
  - trunk: 2 tiles at key segments,
  - branches: mostly 1 tile, with local widening near junctions.
- Paths are painted only over land tiles, resulting in tile ID `3`.

## Autotile/Asset Mapping Strategy

- Keep current renderer contract and tile ID semantics.
- Improve visual quality by feeding better geometry into existing autotiling logic.
- Continue using:
  - external grass middle textures,
  - water middle texture,
  - beach edge texture for coast transitions,
  - `Path_Middle.png` for tile ID `3`.
- Ensure cache-busting revision is bumped when ground assets/mapping change.

## Playability and Validation Rules

- Spawn and all interaction zones must be on walkable tiles (`grass` or `path`).
- All anchors must be mutually reachable through walkable tiles.
- Coastline must not introduce walkable islands detached from main land.
- Debug snapshot must expose:
  - counts by asset type,
  - counts by region (`core`, `transition`, `edge`),
  - path coverage metrics.

## Testing Strategy (TDD)

- Add/adjust unit tests to assert:
  - minimum path coverage,
  - connectivity from spawn to all zones,
  - no zone/spawn placed on blocked tiles,
  - coastline sanity checks (no obvious interior beach artifacts by rule-based assertions),
  - debug snapshot includes new region counters.
- Implement with strict red-green-refactor cycle and focused test runs.

## UX/Readability Notes

- Keep map readability under motion: avoid excessive tiny alternating tiles that shimmer while moving camera.
- Preserve gameplay visibility by not over-texturing roads/plaza boundaries.
- Prefer deterministic generation so level appearance is stable between reloads (important for player orientation).

## Out of Scope

- Building prop/object placement pass (houses, stalls, decor) beyond path-ground groundwork.
- UI HUD changes unrelated to ground rendering.
