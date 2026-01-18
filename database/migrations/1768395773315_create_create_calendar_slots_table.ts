import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'calendar_slots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('calendar_id', 12)
        .notNullable()
        .references('id')
        .inTable('calendars')
        .onDelete('CASCADE')
      table
        .string('teacher_has_class_id', 12)
        .nullable()
        .references('id')
        .inTable('teacher_has_classes')
      table.integer('class_week_day').notNullable() // 0-6 (domingo a sábado)
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.integer('minutes').notNullable()
      table.boolean('is_break').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(
        ['calendar_id', 'teacher_has_class_id', 'class_week_day', 'start_time'],
        'unique_calendar_slot'
      )
      table.index(['calendar_id'])
      table.index(['teacher_has_class_id'])
      table.index(['class_week_day'])
      table.index(['start_time'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
