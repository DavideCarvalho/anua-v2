import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_comments'

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
      table.text('comment').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['event_id'])
      table.index(['user_id'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
