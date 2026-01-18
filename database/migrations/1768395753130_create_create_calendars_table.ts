import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'calendars'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('class_id', 12)
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table
        .string('academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_canceled').defaultTo(false)
      table.boolean('is_approved').defaultTo(false)
      table
        .string('canceled_for_next_calendar_id', 12)
        .nullable()
        .references('id')
        .inTable('calendars')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['class_id'])
      table.index(['academic_period_id'])
      table.index(['is_active'])
      table.index(['is_approved'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
