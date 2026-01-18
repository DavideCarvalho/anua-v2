import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_has_classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
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
      table.string('class_week_day', 10).nullable()
      table.string('start_time', 10).nullable()
      table.string('end_time', 10).nullable()
      table.string('teacher_availability_id', 12).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(
        ['teacher_id', 'class_id', 'subject_id', 'class_week_day', 'start_time', 'end_time'],
        'unique_teacher_has_class'
      )
      table.index(['teacher_id'])
      table.index(['class_id'])
      table.index(['subject_id'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
