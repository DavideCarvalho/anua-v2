import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_gamifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('student_id', 12)
        .notNullable()
        .unique()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.integer('points').defaultTo(0)
      table.integer('level').defaultTo(1)
      table.integer('experience').defaultTo(0)
      table.integer('streak_days').defaultTo(0)
      table.date('last_activity_date').nullable()
      table.integer('total_assignments_completed').defaultTo(0)
      table.integer('total_exams_taken').defaultTo(0)
      table.float('average_grade').defaultTo(0)
      table.integer('attendance_percentage').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(['points'])
      table.index(['level'])
      table.index(['streak_days'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
