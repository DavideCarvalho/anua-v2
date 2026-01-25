import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leaderboards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.string('class_id', 12).nullable().references('id').inTable('classes') // null = toda a escola
      table.string('subject_id', 12).nullable().references('id').inTable('subjects') // null = geral
      table.string('name').notNullable()
      table.text('description').nullable()
      table
        .enum('metric_type', [
          'POINTS',
          'AVERAGE_GRADE',
          'ATTENDANCE_PERCENTAGE',
          'ASSIGNMENTS_COMPLETED',
          'EXAMS_AVERAGE',
          'STREAK_DAYS',
          'BEHAVIOR_SCORE',
        ])
        .notNullable()
      table
        .enum('period_type', ['DAILY', 'WEEKLY', 'MONTHLY', 'ACADEMIC_PERIOD', 'ALL_TIME'])
        .notNullable()
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['class_id'])
      table.index(['subject_id'])
      table.index(['metric_type'])
      table.index(['period_type'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
