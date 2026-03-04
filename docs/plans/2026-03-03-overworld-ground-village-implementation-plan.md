# Overworld Ground Village (Cute Fantasy) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the `/aluno` overworld ground from zero so coastline, grass variation, and organic village paths visually match the Cute Fantasy village reference style while preserving playability.

**Architecture:** Generate map layers procedurally in `overworld-tilemap.ts` using a deterministic island mask, region classification (`core/transition/edge`), and an organic path network connecting spawn and interaction zones. Keep existing tile IDs and renderer contracts, then extend debug snapshot and tests to validate shape, connectivity, and path coverage.

**Tech Stack:** TypeScript, Pixi tile rendering pipeline, Japa unit tests (`node ace test --files ...`).

---

### Task 1: Add failing tests for organic ground rules

**Files:**

- Modify: `tests/unit/engine/overworld_map.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- spawn and all zone anchors are on walkable tiles (`1` or `3`),
- connectivity exists from spawn to each zone using BFS over walkable tiles,
- minimum path count remains above threshold,
- land is one connected component (no detached walkable islands).

```ts
test('spawn reaches all interaction zones via walkable ground', ({ assert }) => {
  // BFS from spawn through ids 1/3 and assert zone positions are visited
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/unit/engine/overworld_map.spec.ts`
Expected: FAIL on missing connectivity/component assertions.

**Step 3: Write minimal implementation**

No production code in this task.

**Step 4: Run test to verify it still fails for expected reason**

Run: `pnpm test --files tests/unit/engine/overworld_map.spec.ts`
Expected: FAIL with assertion mismatch tied to old map generation.

**Step 5: Commit**

```bash
git add tests/unit/engine/overworld_map.spec.ts
git commit -m "test: add overworld connectivity and ground-shape checks"
```

### Task 2: Redesign overworld ground generator (island + paths)

**Files:**

- Modify: `inertia/engine/maps/overworld-tilemap.ts`

**Step 1: Write the failing test**

Add one more failing test proving deterministic generation, e.g. fixed counts/hash snapshot for ground IDs.

```ts
test('procedural overworld generation is deterministic', ({ assert }) => {
  // derive compact signature from ground array and assert stable value
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/unit/engine/overworld_map.spec.ts`
Expected: FAIL because deterministic signature does not match yet.

**Step 3: Write minimal implementation**

In `overworld-tilemap.ts`:

- implement deterministic island mask creation,
- derive `core/transition/edge` region metadata from coast distance,
- paint organic path network (main curved road + plaza + branches),
- preserve tile IDs and walkability validations.

```ts
function buildIslandMask(): boolean[] {
  /* deterministic shape */
}
function classifyRegions(mask: boolean[]): Region[] {
  /* core/transition/edge */
}
function paintVillagePaths(ground: number[]): void {
  /* path id 3 */
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test --files tests/unit/engine/overworld_map.spec.ts`
Expected: PASS with all map tests green.

**Step 5: Commit**

```bash
git add inertia/engine/maps/overworld-tilemap.ts tests/unit/engine/overworld_map.spec.ts
git commit -m "feat: rebuild overworld ground with organic island and village paths"
```

### Task 3: Extend debug snapshot for region counters

**Files:**

- Modify: `inertia/engine/assets/cute-fantasy-tilemap.ts`
- Modify: `tests/unit/engine/cute_fantasy_tilemap.spec.ts`

**Step 1: Write the failing test**

Add test expecting region counters in debug snapshot payload.

```ts
test('debug snapshot includes region counters', ({ assert }) => {
  // assert snapshot.regions.core/transition/edge are present
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/unit/engine/cute_fantasy_tilemap.spec.ts`
Expected: FAIL because region counters are absent.

**Step 3: Write minimal implementation**

Extend debug snapshot types/builders to include region counts and keep backwards compatibility.

```ts
interface OverworldTileDebugSnapshot {
  counts: Record<OverworldDebugAssetType, number>
  regions: { core: number; transition: number; edge: number }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test --files tests/unit/engine/cute_fantasy_tilemap.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/engine/assets/cute-fantasy-tilemap.ts tests/unit/engine/cute_fantasy_tilemap.spec.ts
git commit -m "test: expose overworld region metrics in debug snapshot"
```

### Task 4: Verify external tile mapping and path asset usage

**Files:**

- Modify (if needed): `inertia/engine/assets/external-tiles.ts`
- Test: `tests/unit/engine/cute_fantasy_tilemap.spec.ts`

**Step 1: Write the failing test**

Add/adjust test for path tile resolution and asset-cache revision assumptions.

```ts
test('tile id 3 resolves to external path texture mapping', ({ assert }) => {
  // check mapping behavior contract
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/unit/engine/cute_fantasy_tilemap.spec.ts`
Expected: FAIL if mapping contract changed.

**Step 3: Write minimal implementation**

Adjust external tile mapping and cache revision only if test requires it.

**Step 4: Run test to verify it passes**

Run: `pnpm test --files tests/unit/engine/cute_fantasy_tilemap.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/engine/assets/external-tiles.ts tests/unit/engine/cute_fantasy_tilemap.spec.ts
git commit -m "fix: align external path tile mapping with overworld generator"
```

### Task 5: Full verification sweep

**Files:**

- Test: `tests/unit/engine/overworld_map.spec.ts`
- Test: `tests/unit/engine/cute_fantasy_tilemap.spec.ts`
- Test: `tests/unit/engine/player_sprite.spec.ts`
- Test: `tests/unit/engine/external_player.spec.ts`

**Step 1: Write the failing test**

No new tests.

**Step 2: Run test to verify baseline**

Run each command:

- `pnpm test --files tests/unit/engine/overworld_map.spec.ts`
- `pnpm test --files tests/unit/engine/cute_fantasy_tilemap.spec.ts`
- `pnpm test --files tests/unit/engine/player_sprite.spec.ts`
- `pnpm test --files tests/unit/engine/external_player.spec.ts`

Expected: all PASS.

**Step 3: Write minimal implementation**

No production code in this task.

**Step 4: Run tests to verify final green state**

Re-run the same commands; archive outputs in PR description notes.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify overworld ground redesign test suite"
```

### Task 6: Manual visual verification checklist

**Files:**

- Runtime check in `/aluno`

**Step 1: Write the failing test**

No automated failing test; use manual checklist.

**Step 2: Run verification scenario**

Steps:

1. Open `/aluno`.
2. Hard reload to bust browser cache.
3. Validate coastline continuity (no beach shards in interior).
4. Validate grass variation appears clustered, not checkerboard/noise.
5. Validate village path flow from spawn to all three destinations.
6. Export debug JSON and spot-check counts.

Expected: visual quality matches agreed style direction.

**Step 3: Write minimal implementation**

Apply only minimal tuning if checklist fails.

**Step 4: Re-run checklist**

Expected: pass all checklist items.

**Step 5: Commit**

```bash
git add inertia/engine/maps/overworld-tilemap.ts inertia/engine/assets/cute-fantasy-tilemap.ts
git commit -m "tune: polish overworld ground visuals against reference"
```

## Implementation Notes

- Follow @superpowers/test-driven-development strictly for each behavior change.
- Before declaring done, use @superpowers/verification-before-completion and include command outputs.
- Keep changes DRY/YAGNI: avoid introducing new tile IDs unless visually indispensable.
