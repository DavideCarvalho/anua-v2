import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_monthly_transfers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('canteen_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteens')
        .onDelete('CASCADE')
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.integer('total_amount').notNullable()
      table.enum('status', ['PENDING', 'TRANSFERRED', 'CANCELLED']).defaultTo('PENDING')
      table.timestamp('processed_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['canteen_id', 'month', 'year'])
      table.index(['canteen_id'])
      table.index(['status'])
      table.index(['year', 'month'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
