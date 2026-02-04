import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('CanteenPurchase', (table) => {
      table
        .text('studentPaymentId')
        .nullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })

    this.schema.alterTable('StoreOrder', (table) => {
      table
        .text('studentPaymentId')
        .nullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable('CanteenPurchase', (table) => {
      table.dropColumn('studentPaymentId')
    })

    this.schema.alterTable('StoreOrder', (table) => {
      table.dropColumn('studentPaymentId')
    })
  }
}
