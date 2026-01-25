import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionStatusHistory'

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
      table.specificType('fromStatus', '"SubscriptionStatus"').nullable()
      table.specificType('toStatus', '"SubscriptionStatus"').notNullable()
      table.text('reason').nullable()
      table.timestamp('changedAt').notNullable().defaultTo(this.now())
      table.index(['changedAt'])
      table.index(['subscriptionId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
