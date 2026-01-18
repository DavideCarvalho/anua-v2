import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'occurrences'

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
        .string('teacher_has_class_id', 12)
        .notNullable()
        .references('id')
        .inTable('teacher_has_classes')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.text('text').notNullable()
      table.enum('type', ['BEHAVIOR', 'PERFORMANCE', 'ABSENCE', 'LATE', 'OTHER']).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(['teacher_has_class_id'])
      table.index(['date'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
