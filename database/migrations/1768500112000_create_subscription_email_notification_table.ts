import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionEmailNotification'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('subscriptionInvoiceId')
        .notNullable()
        .references('id')
        .inTable('SubscriptionInvoice')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('emailType').notNullable()
      table.jsonb('recipients').notNullable()
      table.timestamp('sentAt').notNullable().defaultTo(this.now())
      table.integer('daysOverdue').nullable()
      table.jsonb('metadata').nullable()
      table.index(['emailType'])
      table.index(['sentAt'])
      table.index(['subscriptionInvoiceId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
