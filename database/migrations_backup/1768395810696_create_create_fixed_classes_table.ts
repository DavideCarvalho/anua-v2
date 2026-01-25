import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fixed_classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('class_schedule_id', 12)
        .notNullable()
        .references('id')
        .inTable('class_schedules')
        .onDelete('CASCADE')
      table
        .string('teacher_id', 12)
        .notNullable()
        .references('id')
        .inTable('teachers')
        .onDelete('CASCADE')
      table
        .string('class_id', 12)
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table
        .string('subject_id', 12)
        .notNullable()
        .references('id')
        .inTable('subjects')
        .onDelete('CASCADE')
      table.integer('subject_quantity').defaultTo(1)
      table.string('class_week_day', 10).notNullable()
      table.string('start_time', 10).notNullable()
      table.string('end_time', 10).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['class_schedule_id'])
      table.index(['teacher_id'])
      table.index(['class_id'])
      table.index(['subject_id'])
      table.index(['class_week_day'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
