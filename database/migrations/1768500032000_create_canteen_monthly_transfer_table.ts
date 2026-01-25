import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenMonthlyTransfer'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.integer('totalPurchasesAmount').notNullable()
      table.integer('platformFeeAmount').notNullable()
      table.integer('transferAmount').notNullable()
      table.specificType('status', '"TransferStatus"').notNullable().defaultTo('PENDING_APPROVAL')
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
      table.text('pixQrCode').nullable()
      table.text('pixKeySnapshot').nullable()
      table.text('failureReason').nullable()
      table.text('notes').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['canteenId', 'month', 'year'])
      table.index(['approvedBy'])
      table.index(['canteenId'])
      table.index(['status'])
      table.index(['year', 'month'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
