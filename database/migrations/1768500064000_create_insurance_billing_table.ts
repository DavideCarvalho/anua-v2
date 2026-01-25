import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'InsuranceBilling'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('period').notNullable()
      table.integer('insuredStudentsCount').notNullable()
      table.integer('averageTuition').notNullable()
      table.float('insurancePercentage', 8).notNullable()
      table.integer('totalAmount').notNullable()
      table.specificType('status', '"InsuranceBillingStatus"').notNullable().defaultTo('PENDING')
      table.timestamp('dueDate').notNullable()
      table.timestamp('paidAt').nullable()
      table.text('invoiceUrl').nullable()
      table.text('paymentGatewayId').nullable()
      table.text('notes').nullable()
      table.timestamp('lastReminderSentAt').nullable()
      table.index(['dueDate'])
      table.index(['period'])
      table.index(['schoolId'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
