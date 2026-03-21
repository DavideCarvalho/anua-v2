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
