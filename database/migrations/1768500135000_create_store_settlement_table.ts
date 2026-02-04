import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreSettlement'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('storeId')
        .notNullable()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.integer('totalSalesAmount').notNullable().defaultTo(0)
      table.integer('commissionAmount').notNullable().defaultTo(0)
      table.integer('platformFeeAmount').notNullable().defaultTo(0)
      table.integer('transferAmount').notNullable().defaultTo(0)
      table.specificType('status', '"StoreSettlementStatus"').notNullable().defaultTo('PENDING')

      table
        .text('approvedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')

      table.timestamp('approvedAt').nullable()
      table.timestamp('processedAt').nullable()
      table.text('pixTransactionId').nullable()
      table.text('failureReason').nullable()
      table.text('notes').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.unique(['storeId', 'month', 'year'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
