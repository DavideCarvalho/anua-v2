import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreOrder'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('storeId')
        .nullable()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')

      table.specificType('paymentMode', '"StoreOrderPaymentMode"').nullable()
      table.specificType('paymentMethod', '"StoreOrderPaymentMethod"').nullable()

      table
        .text('settlementId')
        .nullable()
        .references('id')
        .inTable('StoreSettlement')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('storeId')
      table.dropColumn('paymentMode')
      table.dropColumn('paymentMethod')
      table.dropColumn('settlementId')
    })
  }
}
