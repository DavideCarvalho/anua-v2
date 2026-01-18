import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_periods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.date('enrollment_start_date').nullable()
      table.date('enrollment_end_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table
        .enum('segment', [
          'KINDERGARTEN',
          'ELEMENTARY',
          'HIGHSCHOOL',
          'TECHNICAL',
          'UNIVERSITY',
          'OTHER',
        ])
        .notNullable()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.boolean('is_closed').defaultTo(false)
      table
        .string('previous_academic_period_id', 12)
        .nullable()
        .references('id')
        .inTable('academic_periods')
      table.float('minimum_grade_override').nullable()
      table.float('minimum_attendance_override').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['is_active'])
      table.index(['segment'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
