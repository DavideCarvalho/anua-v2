import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.string('creator_id', 12).notNullable().references('id').inTable('users')
      table.string('organizer_id', 12).nullable().references('id').inTable('users')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.datetime('start_date').notNullable()
      table.datetime('end_date').nullable()
      table.string('location').nullable()
      table.integer('max_participants').nullable()
      table.boolean('requires_parental_consent').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['creator_id'])
      table.index(['organizer_id'])
      table.index(['start_date'])
      table.index(['is_active'])
      table.index(['requires_parental_consent'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
