import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'WebhookEvent'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('eventId').notNullable().unique()
      table.specificType('provider', '"WebhookProvider"').notNullable()
      table.text('eventType').notNullable()
      table.jsonb('payload').notNullable()
      table.specificType('status', '"WebhookEventStatus"').notNullable().defaultTo('PENDING')
      table.timestamp('processedAt').nullable()
      table.text('error').nullable()
      table.integer('attempts').notNullable().defaultTo(0)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['createdAt'])
      table.index(['provider', 'eventType'])
      table.index(['status', 'createdAt'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
