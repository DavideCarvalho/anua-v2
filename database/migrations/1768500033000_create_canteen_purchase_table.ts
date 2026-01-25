import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenPurchase'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('totalAmount').notNullable()
      table.text('paymentMethod').notNullable()
      table.text('status').notNullable().defaultTo('PENDING')
      table.timestamp('paidAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('monthlyTransferId')
        .nullable()
        .references('id')
        .inTable('CanteenMonthlyTransfer')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['canteenId'])
      table.index(['monthlyTransferId'])
      table.index(['userId', 'createdAt'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
