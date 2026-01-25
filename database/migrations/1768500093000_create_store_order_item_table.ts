import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreOrderItem'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('orderId')
        .notNullable()
        .references('id')
        .inTable('StoreOrder')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('storeItemId')
        .notNullable()
        .references('id')
        .inTable('StoreItem')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable()
      table.integer('unitPrice').notNullable()
      table.specificType('paymentMode', '"PaymentMode"').notNullable()
      table.integer('pointsToMoneyRate').notNullable()
      table.integer('pointsPaid').notNullable()
      table.integer('moneyPaid').notNullable()
      table.text('itemName').notNullable()
      table.text('itemDescription').nullable()
      table.text('itemImageUrl').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.index(['orderId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
