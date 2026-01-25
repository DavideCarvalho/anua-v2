import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_invoices'

  async up() {
    // Enum for invoice status
    this.schema.raw(`
      CREATE TYPE subscription_invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'REFUNDED')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Foreign keys
      table
        .uuid('subscription_id')
        .notNullable()
        .references('id')
        .inTable('subscriptions')
        .onDelete('CASCADE')
      table
        .uuid('academic_period_id')
        .nullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('SET NULL')

      // Invoice period
      table.integer('month').notNullable() // 1-12
      table.integer('year').notNullable()

      // Amounts
      table.integer('active_students').notNullable().defaultTo(0)
      table.integer('amount').notNullable() // in cents

      // Status
      table.specificType('status', 'subscription_invoice_status').notNullable().defaultTo('PENDING')

      // Dates
      table.date('due_date').notNullable()
      table.date('paid_at').nullable()

      // Payment info
      table.text('invoice_url').nullable()
      table.string('payment_gateway_id').nullable()
      table.text('description').nullable()
      table.string('payment_method_snapshot').nullable()
      table.string('credit_card_last_four_digits').nullable()
      table.string('credit_card_brand').nullable()
      table.jsonb('metadata').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['subscription_id'])
      table.index(['academic_period_id'])
      table.index(['status'])
      table.index(['due_date'])
      table.index(['month', 'year'])
      table.index(['payment_gateway_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS subscription_invoice_status')
  }
}
