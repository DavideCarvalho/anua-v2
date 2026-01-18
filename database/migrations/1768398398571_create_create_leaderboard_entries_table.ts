import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leaderboard_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('leaderboard_id', 12)
        .notNullable()
        .references('id')
        .inTable('leaderboards')
        .onDelete('CASCADE')
      table
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.float('score').notNullable()
      table.integer('rank').notNullable()
      table.integer('previous_rank').nullable()
      table.date('calculation_date').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['leaderboard_id', 'student_id', 'calculation_date'])
      table.index(['leaderboard_id'])
      table.index(['student_id'])
      table.index(['rank'])
      table.index(['score'])
      table.index(['calculation_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
