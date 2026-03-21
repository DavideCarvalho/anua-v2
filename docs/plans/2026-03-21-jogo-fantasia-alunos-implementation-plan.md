# Jogo de Fantasia para Alunos - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar um jogo idle/RPG com temática de fantasia para alunos menores de 14 anos, usando componentes 8bitcn/ui.

**Architecture:** SPA com React/Inertia no frontend usando Zustand para estado do jogo. Backend AdonisJS com Postgres para persistência. Missões com timers validados server-side. Substitui o idle game atual e o RPG canvas com PixiJS.

**Tech Stack:** React, Inertia, Zustand, 8bitcn/ui, AdonisJS, Lucid ORM, PostgreSQL

---

## FASE 1: Fundação

### Task 1: Adicionar registro 8bitcn ao shadcn

**Files:**

- Modify: `components.json`

**Step 1: Verificar se components.json existe**

Run: `cat components.json`

**Step 2: Adicionar registro 8bitcn**

Se não existir o registro, adicionar ao `registries` em `components.json`:

```json
{
  "registries": [
    {
      "name": "@8bitcn",
      "url": "https://www.8bitcn.com/r"
    }
  ]
}
```

**Step 3: Verificar registro disponível**

Run: `npx shadcn@latest --help`

**Step 4: Commit**

```bash
git add components.json
git commit -m "feat(game): add 8bitcn registry for 8-bit styled components"
```

---

### Task 2: Instalar componentes 8bitcn/ui base

**Files:**

- Create: `inertia/components/game/ui/` (vários componentes)

**Step 1: Instalar Health Bar**

Run: `npx shadcn@latest add @8bitcn/health-bar`

**Step 2: Instalar Mana Bar**

Run: `npx shadcn@latest add @8bitcn/mana-bar`

**Step 3: Instalar XP Bar**

Run: `npx shadcn@latest add @8bitcn/xp-bar`

**Step 4: Instalar Enemy Health Display**

Run: `npx shadcn@latest add @8bitcn/enemy-health-display`

**Step 5: Instalar Item**

Run: `npx shadcn@latest add @8bitcn/item`

**Step 6: Instalar Button**

Run: `npx shadcn@latest add @8bitcn/button`

**Step 7: Instalar Progress**

Run: `npx shadcn@latest add @8bitcn/progress`

**Step 8: Instalar Badge**

Run: `npx shadcn@latest add @8bitcn/badge`

**Step 9: Instalar Card**

Run: `npx shadcn@latest add @8bitcn/card`

**Step 10: Instalar Tabs**

Run: `npx shadcn@latest add @8bitcn/tabs`

**Step 11: Commit**

```bash
git add inertia/components/game/
git commit -m "feat(game): add 8bitcn/ui components for game interface"
```

---

### Task 3: Criar migration game_characters

**Files:**

- Create: `database/migrations/xxxx_create_game_characters_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_characters_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_characters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.uuid('student_id').references('id').inTable('students').notNullable().unique()
      table.string('name', 50).notNullable()
      table.string('class', 20).notNullable()

      table.integer('level').defaultTo(1)
      table.integer('experience').defaultTo(0)
      table.integer('gold').defaultTo(0)

      table.integer('attack').defaultTo(10)
      table.integer('defense').defaultTo(10)
      table.integer('max_hp').defaultTo(100)
      table.integer('max_mana').defaultTo(50)

      table.integer('energy').defaultTo(100)
      table.integer('max_energy').defaultTo(100)
      table.timestamp('energy_regen_at').nullable()

      table.decimal('idle_gold_per_second', 10, 2).defaultTo(0)
      table.integer('click_damage').defaultTo(1)
      table.decimal('dps', 10, 2).defaultTo(0)
      table.integer('ally_count').defaultTo(0)
      table.integer('current_wave').defaultTo(1)

      table.jsonb('unlocked_skills').defaultTo([])

      table.uuid('equipped_weapon_id').nullable()
      table.uuid('equipped_armor_id').nullable()
      table.uuid('equipped_accessory_id').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_characters_student ON game_characters(student_id);
        CREATE INDEX idx_game_characters_level ON game_characters(level);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_characters migration"
```

---

### Task 4: Criar migration game_missions

**Files:**

- Create: `database/migrations/xxxx_create_game_missions_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_missions_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('location', 50).notNullable()
      table.string('difficulty', 20).defaultTo('normal')

      table.integer('required_level').defaultTo(1)
      table.specificType('required_class', 'varchar(50)[]').defaultTo('{}')

      table.integer('duration_minutes').notNullable()
      table.integer('energy_cost').notNullable()

      table.integer('gold_reward_min').defaultTo(0)
      table.integer('gold_reward_max').defaultTo(0)
      table.integer('experience_reward').defaultTo(0)
      table.jsonb('item_drop_chance').defaultTo({})

      table.boolean('is_active').defaultTo(true)
      table.time('available_from').nullable()
      table.time('available_until').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_missions_location ON game_missions(location);
        CREATE INDEX idx_game_missions_difficulty ON game_missions(difficulty);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_missions migration"
```

---

### Task 5: Criar migration game_character_missions

**Files:**

- Create: `database/migrations/xxxx_create_game_character_missions_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_character_missions_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_character_missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('character_id')
        .references('id')
        .inTable('game_characters')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('mission_id').references('id').inTable('game_missions').notNullable()

      table.string('status', 20).defaultTo('in_progress')
      table.timestamp('started_at').notNullable()
      table.timestamp('completes_at').notNullable()

      table.integer('gold_earned').nullable()
      table.integer('experience_earned').nullable()
      table.jsonb('items_earned').nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_character_missions_character ON game_character_missions(character_id);
        CREATE INDEX idx_game_character_missions_status ON game_character_missions(status);
        CREATE INDEX idx_game_character_missions_completes ON game_character_missions(completes_at);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_character_missions migration"
```

---

### Task 6: Criar migration game_items

**Files:**

- Create: `database/migrations/xxxx_create_game_items_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_items_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('type', 20).notNullable()
      table.string('rarity', 20).defaultTo('common')

      table.integer('attack_bonus').defaultTo(0)
      table.integer('defense_bonus').defaultTo(0)
      table.integer('hp_bonus').defaultTo(0)
      table.integer('mana_bonus').defaultTo(0)
      table.jsonb('special_effect').nullable()

      table.string('icon', 100).nullable()
      table.integer('gold_price').nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_items_type ON game_items(type);
        CREATE INDEX idx_game_items_rarity ON game_items(rarity);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_items migration"
```

---

### Task 7: Criar migration game_character_items

**Files:**

- Create: `database/migrations/xxxx_create_game_character_items_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_character_items_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_character_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('character_id')
        .references('id')
        .inTable('game_characters')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('item_id').references('id').inTable('game_items').notNullable()
      table.integer('quantity').defaultTo(1)

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX idx_game_character_items_unique ON game_character_items(character_id, item_id);
        CREATE INDEX idx_game_character_items_character ON game_character_items(character_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_character_items migration"
```

---

### Task 8: Criar migration game_upgrades

**Files:**

- Create: `database/migrations/xxxx_create_game_upgrades_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_upgrades_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_upgrades'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('type', 50).notNullable()

      table.integer('base_cost').notNullable()
      table.decimal('cost_multiplier', 5, 2).defaultTo(1.35)

      table.string('effect_type', 20).notNullable()
      table.decimal('effect_value', 10, 2).notNullable()

      table.integer('max_level').nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_upgrades migration"
```

---

### Task 9: Criar migration game_character_upgrades

**Files:**

- Create: `database/migrations/xxxx_create_game_character_upgrades_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_character_upgrades_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_character_upgrades'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('character_id')
        .references('id')
        .inTable('game_characters')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('upgrade_id').references('id').inTable('game_upgrades').notNullable()
      table.integer('level').defaultTo(1)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX idx_game_character_upgrades_unique ON game_character_upgrades(character_id, upgrade_id);
        CREATE INDEX idx_game_character_upgrades_character ON game_character_upgrades(character_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_character_upgrades migration"
```

---

### Task 10: Criar migration game_skills

**Files:**

- Create: `database/migrations/xxxx_create_game_skills_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_skills_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_skills'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('class', 20).notNullable()
      table.string('branch', 50).notNullable()

      table.integer('required_level').defaultTo(1)
      table.uuid('required_skill_id').references('id').inTable('game_skills').nullable()

      table.string('effect_type', 50).notNullable()
      table.decimal('effect_value', 10, 2).nullable()

      table.string('icon', 100).nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_skills_class ON game_skills(class);
        CREATE INDEX idx_game_skills_branch ON game_skills(branch);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_skills migration"
```

---

### Task 11: Criar migration game_points_conversions

**Files:**

- Create: `database/migrations/xxxx_create_game_points_conversions_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_points_conversions_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_points_conversions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.uuid('student_id').references('id').inTable('students').notNullable()
      table.integer('points_spent').notNullable()
      table.integer('gold_received').notNullable()
      table.integer('rate').notNullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_points_conversions_student ON game_points_conversions(student_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_points_conversions migration"
```

---

### Task 12: Criar migration game_idle_state

**Files:**

- Create: `database/migrations/xxxx_create_game_idle_state_table.ts`

**Step 1: Criar arquivo de migration**

```typescript
// database/migrations/xxxx_create_game_idle_state_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_idle_state'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('character_id')
        .references('id')
        .inTable('game_characters')
        .notNullable()
        .unique()
        .onDelete('CASCADE')

      table.integer('current_monster_wave').defaultTo(1)
      table.integer('current_monster_hp').nullable()
      table.integer('current_monster_max_hp').nullable()

      table.decimal('offline_gold_earned', 15, 2).defaultTo(0)
      table.timestamp('last_sync_at').notNullable()

      table.timestamp('updated_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_idle_state_character ON game_idle_state(character_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Commit**

```bash
git add database/migrations/
git commit -m "feat(game): add game_idle_state migration"
```

---

### Task 13: Criar Model GameCharacter

**Files:**

- Create: `app/models/game_character.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_character.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import GameCharacterMission from '#models/game_character_mission'
import GameCharacterItem from '#models/game_character_item'
import GameCharacterUpgrade from '#models/game_character_upgrade'
import GameIdleState from '#models/game_idle_state'
import GameItem from '#models/game_item'

export type GameClass = 'mage' | 'warrior' | 'rogue' | 'paladin'

export const CLASS_STATS: Record<
  GameClass,
  { attack: number; defense: number; hp: number; mana: number }
> = {
  mage: { attack: 15, defense: 5, hp: 80, mana: 80 },
  warrior: { attack: 10, defense: 10, hp: 100, mana: 40 },
  rogue: { attack: 12, defense: 7, hp: 90, mana: 50 },
  paladin: { attack: 8, defense: 15, hp: 120, mana: 60 },
}

export default class GameCharacter extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare name: string

  @column()
  declare class: GameClass

  @column()
  declare level: number

  @column()
  declare experience: number

  @column()
  declare gold: number

  @column()
  declare attack: number

  @column()
  declare defense: number

  @column()
  declare maxHp: number

  @column()
  declare maxMana: number

  @column()
  declare energy: number

  @column()
  declare maxEnergy: number

  @column.dateTime()
  declare energyRegenAt: DateTime | null

  @column()
  declare idleGoldPerSecond: number

  @column()
  declare clickDamage: number

  @column()
  declare dps: number

  @column()
  declare allyCount: number

  @column()
  declare currentWave: number

  @column()
  declare unlockedSkills: string[]

  @column()
  declare equippedWeaponId: string | null

  @column()
  declare equippedArmorId: string | null

  @column()
  declare equippedAccessoryId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @hasMany(() => GameCharacterMission)
  declare missions: HasMany<typeof GameCharacterMission>

  @hasMany(() => GameCharacterItem)
  declare items: HasMany<typeof GameCharacterItem>

  @hasMany(() => GameCharacterUpgrade)
  declare upgrades: HasMany<typeof GameCharacterUpgrade>

  @hasOne(() => GameIdleState)
  declare idleState: HasOne<typeof GameIdleState>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedWeaponId',
  })
  declare equippedWeapon: BelongsTo<typeof GameItem>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedArmorId',
  })
  declare equippedArmor: BelongsTo<typeof GameItem>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedAccessoryId',
  })
  declare equippedAccessory: BelongsTo<typeof GameItem>
}
```

**Step 2: Commit**

```bash
git add app/models/game_character.ts
git commit -m "feat(game): add GameCharacter model"
```

---

### Task 14: Criar Model GameMission

**Files:**

- Create: `app/models/game_mission.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_mission.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterMission from '#models/game_character_mission'

export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'epic'
export type GameLocation =
  | 'tavern'
  | 'arena'
  | 'forest'
  | 'mountains'
  | 'dungeon'
  | 'academy'
  | 'market'
  | 'points_shop'
  | 'rankings'

export default class GameMission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare location: GameLocation

  @column()
  declare difficulty: MissionDifficulty

  @column()
  declare requiredLevel: number

  @column()
  declare requiredClass: string[]

  @column()
  declare durationMinutes: number

  @column()
  declare energyCost: number

  @column()
  declare goldRewardMin: number

  @column()
  declare goldRewardMax: number

  @column()
  declare experienceReward: number

  @column()
  declare itemDropChance: Record<string, number>

  @column()
  declare isActive: boolean

  @column()
  declare availableFrom: string | null

  @column()
  declare availableUntil: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => GameCharacterMission)
  declare characterMissions: HasMany<typeof GameCharacterMission>
}
```

**Step 2: Commit**

```bash
git add app/models/game_mission.ts
git commit -m "feat(game): add GameMission model"
```

---

### Task 15: Criar Model GameCharacterMission

**Files:**

- Create: `app/models/game_character_mission.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_character_mission.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameMission from '#models/game_mission'

export type MissionStatus = 'in_progress' | 'completed' | 'claimed'

export default class GameCharacterMission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare missionId: string

  @column()
  declare status: MissionStatus

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare completesAt: DateTime

  @column()
  declare goldEarned: number | null

  @column()
  declare experienceEarned: number | null

  @column()
  declare itemsEarned: Record<string, number> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameMission)
  declare mission: BelongsTo<typeof GameMission>
}
```

**Step 2: Commit**

```bash
git add app/models/game_character_mission.ts
git commit -m "feat(game): add GameCharacterMission model"
```

---

### Task 16: Criar Model GameItem

**Files:**

- Create: `app/models/game_item.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_item.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterItem from '#models/game_character_item'

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export default class GameItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: ItemType

  @column()
  declare rarity: ItemRarity

  @column()
  declare attackBonus: number

  @column()
  declare defenseBonus: number

  @column()
  declare hpBonus: number

  @column()
  declare manaBonus: number

  @column()
  declare specialEffect: Record<string, unknown> | null

  @column()
  declare icon: string | null

  @column()
  declare goldPrice: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => GameCharacterItem)
  declare characterItems: HasMany<typeof GameCharacterItem>
}
```

**Step 2: Commit**

```bash
git add app/models/game_item.ts
git commit -m "feat(game): add GameItem model"
```

---

### Task 17: Criar Model GameCharacterItem

**Files:**

- Create: `app/models/game_character_item.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_character_item.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameItem from '#models/game_item'

export default class GameCharacterItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare itemId: string

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameItem)
  declare item: BelongsTo<typeof GameItem>
}
```

**Step 2: Commit**

```bash
git add app/models/game_character_item.ts
git commit -m "feat(game): add GameCharacterItem model"
```

---

### Task 18: Criar Model GameUpgrade

**Files:**

- Create: `app/models/game_upgrade.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_upgrade.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterUpgrade from '#models/game_character_upgrade'

export type UpgradeType = 'click_power' | 'dps' | 'ally' | 'idle_gold'
export type EffectType = 'add' | 'multiply'

export default class GameUpgrade extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: UpgradeType

  @column()
  declare baseCost: number

  @column()
  declare costMultiplier: number

  @column()
  declare effectType: EffectType

  @column()
  declare effectValue: number

  @column()
  declare maxLevel: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => GameCharacterUpgrade)
  declare characterUpgrades: HasMany<typeof GameCharacterUpgrade>
}
```

**Step 2: Commit**

```bash
git add app/models/game_upgrade.ts
git commit -m "feat(game): add GameUpgrade model"
```

---

### Task 19: Criar Model GameCharacterUpgrade

**Files:**

- Create: `app/models/game_character_upgrade.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_character_upgrade.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameUpgrade from '#models/game_upgrade'

export default class GameCharacterUpgrade extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare upgradeId: string

  @column()
  declare level: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameUpgrade)
  declare upgrade: BelongsTo<typeof GameUpgrade>
}
```

**Step 2: Commit**

```bash
git add app/models/game_character_upgrade.ts
git commit -m "feat(game): add GameCharacterUpgrade model"
```

---

### Task 20: Criar Model GameSkill

**Files:**

- Create: `app/models/game_skill.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_skill.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { GameClass } from '#models/game_character'

export default class GameSkill extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare class: GameClass | 'all'

  @column()
  declare branch: string

  @column()
  declare requiredLevel: number

  @column()
  declare requiredSkillId: string | null

  @column()
  declare effectType: string

  @column()
  declare effectValue: number | null

  @column()
  declare icon: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameSkill, {
    foreignKey: 'requiredSkillId',
  })
  declare requiredSkill: BelongsTo<typeof GameSkill>
}
```

**Step 2: Commit**

```bash
git add app/models/game_skill.ts
git commit -m "feat(game): add GameSkill model"
```

---

### Task 21: Criar Model GamePointsConversion

**Files:**

- Create: `app/models/game_points_conversion.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_points_conversion.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'

export default class GamePointsConversion extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare pointsSpent: number

  @column()
  declare goldReceived: number

  @column()
  declare rate: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
```

**Step 2: Commit**

```bash
git add app/models/game_points_conversion.ts
git commit -m "feat(game): add GamePointsConversion model"
```

---

### Task 22: Criar Model GameIdleState

**Files:**

- Create: `app/models/game_idle_state.ts`

**Step 1: Criar o model**

```typescript
// app/models/game_idle_state.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'

export default class GameIdleState extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare currentMonsterWave: number

  @column()
  declare currentMonsterHp: number | null

  @column()
  declare currentMonsterMaxHp: number | null

  @column()
  declare offlineGoldEarned: number

  @column.dateTime()
  declare lastSyncAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>
}
```

**Step 2: Commit**

```bash
git add app/models/game_idle_state.ts
git commit -m "feat(game): add GameIdleState model"
```

---

### Task 23: Executar migrations

**Step 1: Rodar migrations**

Run: `node ace migration:run`

**Step 2: Verificar tabelas criadas**

Run: `node ace db:table game_characters`

---

## FASE 2: Core Loop

### Task 24: Criar tipos TypeScript do jogo

**Files:**

- Create: `inertia/types/game.ts`

**Step 1: Criar arquivo de tipos**

```typescript
// inertia/types/game.ts

export type GameClass = 'mage' | 'warrior' | 'rogue' | 'paladin'
export type GameLocation =
  | 'tavern'
  | 'arena'
  | 'forest'
  | 'mountains'
  | 'dungeon'
  | 'academy'
  | 'market'
  | 'points_shop'
  | 'rankings'
export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'epic'
export type MissionStatus = 'in_progress' | 'completed' | 'claimed'
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface GameCharacter {
  id: string
  studentId: string
  name: string
  class: GameClass
  level: number
  experience: number
  gold: number
  attack: number
  defense: number
  maxHp: number
  maxMana: number
  energy: number
  maxEnergy: number
  energyRegenAt: string | null
  idleGoldPerSecond: number
  clickDamage: number
  dps: number
  allyCount: number
  currentWave: number
  unlockedSkills: string[]
  equippedWeaponId: string | null
  equippedArmorId: string | null
  equippedAccessoryId: string | null
  equippedWeapon?: GameItem
  equippedArmor?: GameItem
  equippedAccessory?: GameItem
}

export interface GameMission {
  id: string
  name: string
  description: string | null
  location: GameLocation
  difficulty: MissionDifficulty
  requiredLevel: number
  requiredClass: string[]
  durationMinutes: number
  energyCost: number
  goldRewardMin: number
  goldRewardMax: number
  experienceReward: number
  itemDropChance: Record<string, number>
  isActive: boolean
}

export interface GameCharacterMission {
  id: string
  characterId: string
  missionId: string
  mission: GameMission
  status: MissionStatus
  startedAt: string
  completesAt: string
  goldEarned: number | null
  experienceEarned: number | null
  itemsEarned: Record<string, number> | null
}

export interface GameItem {
  id: string
  name: string
  description: string | null
  type: ItemType
  rarity: ItemRarity
  attackBonus: number
  defenseBonus: number
  hpBonus: number
  manaBonus: number
  specialEffect: Record<string, unknown> | null
  icon: string | null
  goldPrice: number | null
}

export interface GameCharacterItem {
  id: string
  itemId: string
  item: GameItem
  quantity: number
}

export interface GameUpgrade {
  id: string
  name: string
  description: string | null
  type: string
  baseCost: number
  costMultiplier: number
  effectType: string
  effectValue: number
  maxLevel: number | null
}

export interface GameCharacterUpgrade {
  id: string
  upgradeId: string
  upgrade: GameUpgrade
  level: number
}

export interface GameIdleState {
  id: string
  characterId: string
  currentMonsterWave: number
  currentMonsterHp: number | null
  currentMonsterMaxHp: number | null
  offlineGoldEarned: number
  lastSyncAt: string
}

export const CLASS_INFO: Record<GameClass, { name: string; description: string; color: string }> = {
  mage: {
    name: 'Mago',
    description: 'Alto poder de ataque, vida baixa. Especialista em magia destrutiva.',
    color: 'text-purple-500',
  },
  warrior: {
    name: 'Guerreiro',
    description: 'Balanceado em ataque e defesa. Versátil em combate.',
    color: 'text-red-500',
  },
  rogue: {
    name: 'Ladino',
    description: 'Mestres dos críticos e evasão. Ataques rápidos e letais.',
    color: 'text-green-500',
  },
  paladin: {
    name: 'Paladino',
    description: 'Alta vida e defesa. Protetor e curandeiro.',
    color: 'text-yellow-500',
  },
}

export const LOCATION_INFO: Record<
  GameLocation,
  { name: string; icon: string; description: string }
> = {
  tavern: { name: 'Taverna', icon: '🏠', description: 'Hub central' },
  arena: { name: 'Arena', icon: '⚔️', description: 'Batalhas infinitas' },
  forest: { name: 'Floresta', icon: '🌲', description: 'Missões de caça' },
  mountains: { name: 'Montanhas', icon: '🏔️', description: 'Missões de exploração' },
  dungeon: { name: 'Dungeon', icon: '🏰', description: 'Missões de boss' },
  academy: { name: 'Academia', icon: '📚', description: 'Habilidades' },
  market: { name: 'Mercado', icon: '🏪', description: 'Loja com gold' },
  points_shop: { name: 'Loja de Pontos', icon: '💎', description: 'Converter pontos' },
  rankings: { name: 'Rankings', icon: '🏆', description: 'Ver outros alunos' },
}
```

**Step 2: Commit**

```bash
git add inertia/types/game.ts
git commit -m "feat(game): add game TypeScript types"
```

---

### Task 25: Criar store Zustand do jogo

**Files:**

- Create: `inertia/stores/game-store.ts`

**Step 1: Criar store**

```typescript
// inertia/stores/game-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameCharacter, GameCharacterMission, GameIdleState } from '../types/game'

interface GameState {
  character: GameCharacter | null
  activeMissions: GameCharacterMission[]
  idleState: GameIdleState | null

  setCharacter: (character: GameCharacter | null) => void
  setActiveMissions: (missions: GameCharacterMission[]) => void
  setIdleState: (state: GameIdleState | null) => void

  updateGold: (delta: number) => void
  updateEnergy: (energy: number) => void
  updateExperience: (xp: number) => void

  addMission: (mission: GameCharacterMission) => void
  removeMission: (missionId: string) => void
  updateMissionStatus: (missionId: string, status: string) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      character: null,
      activeMissions: [],
      idleState: null,

      setCharacter: (character) => set({ character }),
      setActiveMissions: (missions) => set({ activeMissions: missions }),
      setIdleState: (idleState) => set({ idleState }),

      updateGold: (delta) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, gold: state.character.gold + delta }
            : null,
        })),

      updateEnergy: (energy) =>
        set((state) => ({
          character: state.character ? { ...state.character, energy } : null,
        })),

      updateExperience: (xp) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, experience: state.character.experience + xp }
            : null,
        })),

      addMission: (mission) =>
        set((state) => ({
          activeMissions: [...state.activeMissions, mission],
        })),

      removeMission: (missionId) =>
        set((state) => ({
          activeMissions: state.activeMissions.filter((m) => m.id !== missionId),
        })),

      updateMissionStatus: (missionId, status) =>
        set((state) => ({
          activeMissions: state.activeMissions.map((m) =>
            m.id === missionId ? { ...m, status: status as any } : m
          ),
        })),
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        character: state.character,
        activeMissions: state.activeMissions,
        idleState: state.idleState,
      }),
    }
  )
)
```

**Step 2: Commit**

```bash
git add inertia/stores/game-store.ts
git commit -m "feat(game): add Zustand store for game state"
```

---

### Task 26: Criar controller para página do jogo

**Files:**

- Create: `app/controllers/pages/aluno/show_aluno_jogo_page_controller.ts`
- Modify: `start/routes/pages/aluno.ts`

**Step 1: Criar controller**

```typescript
// app/controllers/pages/aluno/show_aluno_jogo_page_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import GameCharacter from '#models/game_character'

export default class ShowAlunoJogoPageController {
  async handle({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const student = await user.related('student').query().first()

    if (!student) {
      return inertia.render('aluno/jogo/create-character', {
        studentName: user.fullName,
      })
    }

    const character = await GameCharacter.query()
      .where('student_id', student.id)
      .preload('equippedWeapon')
      .preload('equippedArmor')
      .preload('equippedAccessory')
      .first()

    if (!character) {
      return inertia.render('aluno/jogo/create-character', {
        studentName: user.fullName,
      })
    }

    return inertia.render('aluno/jogo/tavern', {
      character: character.serialize(),
    })
  }
}
```

**Step 2: Registrar rota**

Modificar `start/routes/pages/aluno.ts`:

```typescript
// Adicionar import
const ShowAlunoJogoPageController = () =>
  import('#controllers/pages/aluno/show_aluno_jogo_page_controller')

// Adicionar rota no grupo
router.get('/jogo', [ShowAlunoJogoPageController]).as('jogo')
```

**Step 3: Commit**

```bash
git add app/controllers/pages/aluno/show_aluno_jogo_page_controller.ts start/routes/pages/aluno.ts
git commit -m "feat(game): add jogo page controller"
```

---

### Task 27: Criar página de criação de personagem

**Files:**

- Create: `inertia/pages/aluno/jogo/create-character.tsx`

**Step 1: Criar página**

```typescript
// inertia/pages/aluno/jogo/create-character.tsx
import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { CLASS_INFO, type GameClass } from '../../../types/game'

interface CreateCharacterProps {
  studentName: string
}

const CLASSES: GameClass[] = ['mage', 'warrior', 'rogue', 'paladin']

export default function CreateCharacterPage({ studentName }: CreateCharacterProps) {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<GameClass>('warrior')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    // TODO: Implementar criação via API
  }

  return (
    <AlunoLayout>
      <Head title="Criar Personagem" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Bem-vindo ao Reino Mágico!</h1>
          <p className="mt-2 text-muted-foreground">
            Crie seu personagem para começar sua aventura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Nome do Personagem
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Digite o nome..."
              className="w-full rounded-lg border bg-background px-4 py-3 text-lg"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">Escolha sua Classe</label>
            <div className="grid grid-cols-2 gap-4">
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedClass === cls
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className={`text-lg font-bold ${CLASS_INFO[cls].color}`}>
                    {CLASS_INFO[cls].name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {CLASS_INFO[cls].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Personagem'}
          </button>
        </form>
      </div>
    </AlunoLayout>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/pages/aluno/jogo/create-character.tsx
git commit -m "feat(game): add create character page"
```

---

### Task 28: Criar API para criar personagem

**Files:**

- Create: `app/controllers/api/game/create_game_character_controller.ts`
- Modify: `start/routes/api/game.ts`

**Step 1: Criar controller**

```typescript
// app/controllers/api/game/create_game_character_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import GameCharacter from '#models/game_character'
import { CLASS_STATS, type GameClass } from '#models/game_character'
import { createGameCharacterValidator } from '#validators/game_character'

export default class CreateGameCharacterController {
  async handle({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const student = await user.related('student').query().first()

    if (!student) {
      return response.forbidden({ message: 'Student not found' })
    }

    const existing = await GameCharacter.query().where('student_id', student.id).first()

    if (existing) {
      return response.conflict({ message: 'Character already exists' })
    }

    const { name, class: characterClass } = await request.validateUsing(
      createGameCharacterValidator
    )

    const stats = CLASS_STATS[characterClass as GameClass]

    const character = await GameCharacter.create({
      studentId: student.id,
      name,
      class: characterClass as GameClass,
      attack: stats.attack,
      defense: stats.defense,
      maxHp: stats.hp,
      maxMana: stats.mana,
      energy: 100,
      maxEnergy: 100,
    })

    await character.related('idleState').create({
      currentMonsterWave: 1,
      offlineGoldEarned: 0,
      lastSyncAt: new Date(),
    })

    return response.created(character.serialize())
  }
}
```

**Step 2: Criar validator**

```typescript
// app/validators/game_character.ts
import vine from '@vinejs/vine'

export const createGameCharacterValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    class: vine.enum(['mage', 'warrior', 'rogue', 'paladin']),
  })
)
```

**Step 3: Criar arquivo de rotas**

```typescript
// start/routes/api/game.ts
import router from '@adonisjs/core/services/router'

const CreateGameCharacterController = () =>
  import('#controllers/api/game/create_game_character_controller')

export function registerGameApiRoutes() {
  router
    .group(() => {
      router.post('/characters', [CreateGameCharacterController]).as('createCharacter')
    })
    .prefix('/game')
    .as('game')
}
```

**Step 4: Registrar no index**

Modificar `start/routes/api/index.ts` para importar as rotas do jogo.

**Step 5: Commit**

```bash
git add app/controllers/api/game/ app/validators/game_character.ts start/routes/api/game.ts
git commit -m "feat(game): add create character API"
```

---

## Verificação Fim de Fase

**Run:**

```bash
node ace typecheck
node ace lint
```

---

## Próximas Fases

O plano continua com mais tasks para:

- **FASE 2 (continuação):** Sistema de energia, Missões com timers, Coleta de recompensas
- **FASE 3:** Idle Game (Arena), Sistema de upgrades, Acumulação offline
- **FASE 4:** Sistema de níveis, Árvores de habilidades, Inventário e equipamentos
- **FASE 5:** Loja com gold, Conversão pontos → gold, Rankings
- **FASE 6:** Polish, Visual 8-bit, Animações, Testes

**O plano completo será expandido em iterações subsequentes conforme cada fase é completada.**
