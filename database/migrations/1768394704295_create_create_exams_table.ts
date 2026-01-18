import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.date('exam_date').notNullable()
      table.float('total_points').notNullable()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table
        .string('academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
      table
        .string('subject_id', 12)
        .notNullable()
        .references('id')
        .inTable('subjects')
        .onDelete('CASCADE')
      table.string('class_id', 12).nullable().references('id').inTable('classes')
      table.string('teacher_id', 12).notNullable().references('id').inTable('users')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['academic_period_id'])
      table.index(['subject_id'])
      table.index(['class_id'])
      table.index(['teacher_id'])
      table.index(['exam_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
