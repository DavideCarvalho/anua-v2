import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_status_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Foreign key
      table
        .uuid('subscription_id')
        .notNullable()
        .references('id')
        .inTable('subscriptions')
        .onDelete('CASCADE')

      // Status change
      table.string('from_status').nullable()
      table.string('to_status').notNullable()
      table.text('reason').nullable()
      table.timestamp('changed_at').notNullable().defaultTo(this.now())

      // Indexes
      table.index(['subscription_id'])
      table.index(['changed_at'])
      table.index(['to_status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
