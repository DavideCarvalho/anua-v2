import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionInvoice'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('subscriptionId')
        .notNullable()
        .references('id')
        .inTable('Subscription')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('academicPeriodId').nullable()
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.integer('activeStudents').notNullable().defaultTo(0)
      table.integer('amount').notNullable()
      table.specificType('status', '"PaymentStatus"').notNullable()
      table.date('dueDate').notNullable()
      table.date('paidAt').nullable()
      table.text('invoiceUrl').nullable()
      table.text('paymentGatewayId').nullable()
      table.text('description').nullable()
      table.text('paymentMethodSnapshot').nullable()
      table.text('creditCardLastFourDigits').nullable()
      table.text('creditCardBrand').nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['academicPeriodId'])
      table.index(['dueDate'])
      table.index(['status'])
      table.index(['subscriptionId'])
      table.index(['year', 'month'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
