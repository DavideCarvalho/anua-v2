import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasExtraClassAttendance'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('extraClassAttendanceId')
        .notNullable()
        .references('id')
        .inTable('ExtraClassAttendance')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('status', '"AttendanceStatus"').notNullable()
      table.text('justification').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['studentId'])
      table.index(['extraClassAttendanceId'])
      table.unique(['studentId', 'extraClassAttendanceId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
