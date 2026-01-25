import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table
        .string('attendance_id', 12)
        .notNullable()
        .references('id')
        .inTable('attendances')
        .onDelete('CASCADE')
      table.enum('status', ['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']).defaultTo('ABSENT')
      table.text('justification').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['student_id', 'attendance_id'])
      table.index(['student_id'])
      table.index(['attendance_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
