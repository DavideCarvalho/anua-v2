import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasAttendance'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('attendanceId')
        .notNullable()
        .references('id')
        .inTable('Attendance')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.specificType('status', '"AttendanceStatus"').notNullable().defaultTo('ABSENT')
      table.text('justification').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
