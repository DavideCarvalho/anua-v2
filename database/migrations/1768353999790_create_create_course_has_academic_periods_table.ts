import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'course_has_academic_periods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .string('course_id', 12)
        .notNullable()
        .references('id')
        .inTable('courses')
        .onDelete('CASCADE')
      table
        .string('academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['course_id', 'academic_period_id'])
      table.index(['course_id'])
      table.index(['academic_period_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
