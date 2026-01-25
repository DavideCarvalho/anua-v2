import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_meals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('canteen_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteens')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.integer('price').notNullable()
      table.timestamp('served_at').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.integer('max_reservations').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['canteen_id'])
      table.index(['served_at'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
