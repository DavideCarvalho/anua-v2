import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_assignments'

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
        .string('assignment_id', 12)
        .notNullable()
        .references('id')
        .inTable('assignments')
        .onDelete('CASCADE')
      table.float('grade').nullable()
      table.timestamp('submitted_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['student_id', 'assignment_id'])
      table.index(['student_id'])
      table.index(['assignment_id'])
      table.index(['submitted_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
