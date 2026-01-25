import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TuitionTransfer'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentPaymentId')
        .notNullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .unique()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('paymentAmount').notNullable()
      table.integer('platformFeeAmount').notNullable()
      table.integer('transferAmount').notNullable()
      table.float('platformFeePercentage', 8).notNullable()
      table.specificType('status', '"TuitionTransferStatus"').notNullable().defaultTo('PENDING')
      table.text('pixTransactionId').nullable()
      table.text('pixTransactionStatus').nullable()
      table.text('failureReason').nullable()
      table.integer('retryCount').notNullable().defaultTo(0)
      table.timestamp('lastRetryAt').nullable()
      table.timestamp('processedAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['createdAt'])
      table.index(['processedAt'])
      table.index(['schoolId'])
      table.index(['schoolId', 'status'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
