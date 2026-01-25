import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentPayment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('amount').notNullable()
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.specificType('type', '"PaymentType"').notNullable()
      table.specificType('status', '"PaymentStatus"').notNullable().defaultTo('NOT_PAID')
      table.integer('totalAmount').notNullable().defaultTo(0)
      table.date('dueDate').notNullable()
      table.integer('installments').notNullable().defaultTo(1)
      table.integer('installmentNumber').notNullable().defaultTo(1)
      table.integer('discountPercentage').notNullable().defaultTo(0)
      table.date('paidAt').nullable()
      table.timestamp('emailSentAt').nullable()
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('classHasAcademicPeriodId')
        .nullable()
        .references('id')
        .inTable('ClassHasAcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('studentHasLevelId')
        .nullable()
        .references('id')
        .inTable('StudentHasLevel')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('invoiceUrl').nullable()
      table.text('paymentGatewayId').nullable().unique()
      table.specificType('paymentGateway', '"PaymentGateway"').nullable()
      table.jsonb('metadata').nullable()
      table
        .text('agreementId')
        .nullable()
        .references('id')
        .inTable('Agreement')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('insuranceBillingId')
        .nullable()
        .references('id')
        .inTable('InsuranceBilling')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['insuranceBillingId'])
      table.index(['studentId', 'month', 'year'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
