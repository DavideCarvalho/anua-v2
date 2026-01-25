import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_grades'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('exam_id', 12)
        .notNullable()
        .references('id')
        .inTable('exams')
        .onDelete('CASCADE')
      table
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.float('points_earned').notNullable()
      table.text('feedback').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['exam_id', 'student_id'])
      table.index(['exam_id'])
      table.index(['student_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
