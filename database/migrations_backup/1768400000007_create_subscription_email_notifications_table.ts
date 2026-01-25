import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_email_notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Foreign key
      table
        .uuid('subscription_invoice_id')
        .notNullable()
        .references('id')
        .inTable('subscription_invoices')
        .onDelete('CASCADE')

      // Notification info
      table.string('email_type').notNullable()
      table.jsonb('recipients').notNullable()
      table.timestamp('sent_at').notNullable().defaultTo(this.now())
      table.integer('days_overdue').nullable()
      table.jsonb('metadata').nullable()

      // Indexes
      table.index(['subscription_invoice_id'])
      table.index(['email_type'])
      table.index(['sent_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
