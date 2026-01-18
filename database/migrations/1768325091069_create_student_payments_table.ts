import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('student_id').notNullable().references('id').inTable('students').onDelete('CASCADE')
      table.integer('amount').notNullable()
      table.integer('month').notNullable()
      table.integer('year').notNullable()

      table.enum('type', [
        'ENROLLMENT',
        'TUITION',
        'CANTEEN',
        'COURSE',
        'AGREEMENT',
        'STUDENT_LOAN',
        'OTHER'
      ]).notNullable()

      table.enum('status', [
        'NOT_PAID',
        'PENDING',
        'PAID',
        'OVERDUE',
        'CANCELLED',
        'FAILED'
      ]).defaultTo('NOT_PAID')

      table.integer('total_amount').defaultTo(0)
      table.date('due_date').notNullable()
      table.integer('installments').defaultTo(1)
      table.integer('installment_number').defaultTo(1)
      table.integer('discount_percentage').defaultTo(0)
      table.date('paid_at').nullable()
      table.timestamp('email_sent_at', { useTz: true }).nullable()

      table.uuid('contract_id').notNullable()
      table.uuid('class_has_academic_period_id').nullable()
      table.uuid('student_has_level_id').nullable()
      table.string('invoice_url').nullable()
      table.string('payment_gateway_id').nullable().unique()

      table.enum('payment_gateway', ['ASAAS', 'CUSTOM']).nullable()

      table.json('metadata').nullable()
      table.uuid('agreement_id').nullable()
      table.uuid('insurance_billing_id').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['student_id', 'month', 'year'])
      table.index(['insurance_billing_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
