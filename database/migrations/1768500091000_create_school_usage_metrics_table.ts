import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolUsageMetrics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.integer('activeStudents').notNullable().defaultTo(0)
      table.integer('activeTeachers').notNullable().defaultTo(0)
      table.integer('activeUsers').notNullable().defaultTo(0)
      table.integer('classesCreated').notNullable().defaultTo(0)
      table.integer('assignmentsCreated').notNullable().defaultTo(0)
      table.integer('attendanceRecords').notNullable().defaultTo(0)
      table.integer('totalRevenue').notNullable().defaultTo(0)
      table.integer('totalEnrollments').notNullable().defaultTo(0)
      table.integer('loginCount').notNullable().defaultTo(0)
      table.timestamp('lastActivityAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.unique(['schoolId', 'month', 'year'])
      table.index(['schoolId'])
      table.index(['year', 'month'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
