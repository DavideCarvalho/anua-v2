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
