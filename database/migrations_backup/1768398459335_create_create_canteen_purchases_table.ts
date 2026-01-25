import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_purchases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('user_id', 12).notNullable().references('id').inTable('users')
      table.string('canteen_id', 12).notNullable().references('id').inTable('canteens')
      table.integer('total_amount').notNullable() // Em centavos
      table.enum('payment_method', ['BALANCE', 'CASH', 'CARD', 'PIX']).notNullable()
      table.enum('status', ['PENDING', 'PAID', 'CANCELLED']).defaultTo('PENDING')
      table.timestamp('paid_at').nullable()
      table.string('monthly_transfer_id', 12).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id'])
      table.index(['canteen_id'])
      table.index(['status'])
      table.index(['payment_method'])
      table.index(['created_at'])
      table.index(['monthly_transfer_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
