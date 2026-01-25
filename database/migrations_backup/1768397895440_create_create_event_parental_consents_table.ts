import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_parental_consents'

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
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table
        .string('responsible_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.enum('status', ['PENDING', 'APPROVED', 'DENIED', 'EXPIRED']).defaultTo('PENDING')
      table.text('notes').nullable()
      table.timestamp('requested_at').defaultTo('now')
      table.timestamp('approved_at').nullable()
      table.timestamp('denied_at').nullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['event_id', 'student_id'])
      table.index(['event_id'])
      table.index(['student_id'])
      table.index(['responsible_id'])
      table.index(['status'])
      table.index(['expires_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
