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
