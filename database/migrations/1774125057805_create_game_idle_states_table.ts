import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_idle_states'

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
        CREATE INDEX idx_game_idle_states_character ON game_idle_states(character_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
