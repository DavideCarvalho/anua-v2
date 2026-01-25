import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'InsuranceClaim'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('studentPaymentId')
        .notNullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('claimDate').notNullable().defaultTo(this.now())
      table.integer('overdueAmount').notNullable()
      table.float('coveragePercentage', 8).notNullable()
      table.integer('coveredAmount').notNullable()
      table.specificType('status', '"InsuranceClaimStatus"').notNullable().defaultTo('PENDING')
      table.timestamp('approvedAt').nullable()
      table
        .text('approvedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('paidAt').nullable()
      table.timestamp('rejectedAt').nullable()
      table
        .text('rejectedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('rejectionReason').nullable()
      table.text('notes').nullable()
      table.index(['approvedBy'])
      table.index(['claimDate'])
      table.index(['rejectedBy'])
      table.index(['status'])
      table.index(['studentPaymentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
