import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('event_id', 12)
        .notNullable()
        .references('id')
        .inTable('events')
        .onDelete('CASCADE')
      table
        .string('user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .enum('status', ['REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED'])
        .defaultTo('REGISTERED')
      table.timestamp('registered_at').defaultTo('now')
      table.timestamp('confirmed_at').nullable()
      table.timestamp('cancelled_at').nullable()
      table.text('cancellation_reason').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['event_id', 'user_id'])
      table.index(['event_id'])
      table.index(['user_id'])
      table.index(['status'])
      table.index(['registered_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
