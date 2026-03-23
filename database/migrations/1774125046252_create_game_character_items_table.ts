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
