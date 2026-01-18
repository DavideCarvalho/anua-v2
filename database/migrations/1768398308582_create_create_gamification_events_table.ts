import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gamification_events'

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
        .enum('event_type', [
          'POINTS_EARNED',
          'POINTS_SPENT',
          'ACHIEVEMENT_UNLOCKED',
          'LEVEL_UP',
          'STREAK_MILESTONE',
          'ASSIGNMENT_COMPLETED',
          'EXAM_TAKEN',
          'PERFECT_ATTENDANCE',
          'GOOD_BEHAVIOR',
          'PARTICIPATION',
        ])
        .notNullable()
      table.integer('points_change').defaultTo(0) // Pode ser positivo ou negativo
      table.string('achievement_id', 12).nullable().references('id').inTable('achievements')
      table.text('description').nullable()
      table.json('metadata').nullable() // Dados adicionais específicos do evento
      table.timestamp('created_at')

      table.index(['student_id'])
      table.index(['event_type'])
      table.index(['achievement_id'])
      table.index(['created_at'])
      table.index(['points_change'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
