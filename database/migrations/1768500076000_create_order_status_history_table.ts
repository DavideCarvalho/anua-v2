import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'OrderStatusHistory'

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
      table.specificType('fromStatus', '"OrderStatus"').nullable()
      table.specificType('toStatus', '"OrderStatus"').notNullable()
      table
        .text('changedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('notes').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.index(['orderId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
