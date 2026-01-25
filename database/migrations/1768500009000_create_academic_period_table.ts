import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicPeriod'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable().unique()
      table.date('startDate').notNullable()
      table.date('endDate').notNullable()
      table.date('enrollmentStartDate').nullable()
      table.date('enrollmentEndDate').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.specificType('segment', '"AcademicPeriodSegment"').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.boolean('isClosed').notNullable().defaultTo(false)
      table
        .text('previousAcademicPeriodId')
        .nullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.float('minimumGradeOverride', 8).nullable()
      table.float('minimumAttendanceOverride', 8).nullable()
      table.timestamp('deletedAt').nullable()
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
