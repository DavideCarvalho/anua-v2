import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_meal_reservations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('canteen_meal_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteen_meals')
        .onDelete('CASCADE')
      table.string('user_id', 12).notNullable().references('id').inTable('users')
      table.integer('quantity').notNullable().defaultTo(1)
      table.enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'CONSUMED']).defaultTo('PENDING')
      table.timestamp('consumed_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['canteen_meal_id'])
      table.index(['user_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
