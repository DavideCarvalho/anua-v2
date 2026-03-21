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
