import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'level_assigned_to_course_has_academic_periods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .string('level_id', 12)
        .notNullable()
        .references('id')
        .inTable('levels')
        .onDelete('CASCADE')
      table
        .uuid('course_has_academic_period_id')
        .notNullable()
        .references('id')
        .inTable('course_has_academic_periods')
        .onDelete('CASCADE')
      table.boolean('is_active').defaultTo(true)

      table.unique(
        ['level_id', 'course_has_academic_period_id'],
        'unique_level_course_academic_period'
      )
      table.index(['level_id'])
      table.index(['course_has_academic_period_id'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
