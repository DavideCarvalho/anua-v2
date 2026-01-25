import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentBalanceTransaction'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.integer('amount').notNullable()
      table.specificType('type', '"BalanceTransactionType"').notNullable()
      table
        .specificType('status', '"BalanceTransactionStatus"')
        .notNullable()
        .defaultTo('COMPLETED')
      table.text('description').nullable()
      table.integer('previousBalance').notNullable()
      table.integer('newBalance').notNullable()
      table
        .text('canteenPurchaseId')
        .nullable()
        .references('id')
        .inTable('CanteenPurchase')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('storeOrderId')
        .nullable()
        .references('id')
        .inTable('StoreOrder')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('responsibleId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('paymentGatewayId').nullable()
      table.text('paymentMethod').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['studentId', 'createdAt'])
      table.index(['type', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
