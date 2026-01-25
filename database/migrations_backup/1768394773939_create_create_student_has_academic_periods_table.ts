import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_academic_periods'

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
        .string('academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
      table.string('class_id', 12).nullable().references('id').inTable('classes')

      table.unique(['student_id', 'academic_period_id'])
      table.index(['student_id'])
      table.index(['academic_period_id'])
      table.index(['class_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
