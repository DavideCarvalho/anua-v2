import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'insurance_billings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.date('period').notNullable() // primeiro dia do mês de faturamento
      table.integer('insured_students_count').notNullable()
      table.integer('average_tuition').notNullable() // em centavos
      table.float('insurance_percentage').notNullable()
      table.integer('total_amount').notNullable() // em centavos
      table
        .enum('status', ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'], {
          useNative: true,
          enumName: 'insurance_billing_status',
          existingType: false,
        })
        .defaultTo('PENDING')
        .notNullable()
      table.date('due_date').notNullable()
      table.timestamp('paid_at').nullable()
      table.string('invoice_url').nullable()
      table.string('payment_gateway_id').nullable()
      table.timestamp('last_reminder_sent_at').nullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['school_id'])
      table.index(['status'])
      table.index(['period'])
      table.unique(['school_id', 'period'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "insurance_billing_status"')
  }
}
