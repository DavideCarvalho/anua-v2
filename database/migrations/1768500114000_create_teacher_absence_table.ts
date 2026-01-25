import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TeacherAbsence'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('absenceId')
        .notNullable()
        .references('id')
        .inTable('Absence')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
        .unique()
      table
        .text('calendarSlotId')
        .notNullable()
        .references('id')
        .inTable('CalendarSlot')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('teacherIdTookPlace')
        .nullable()
        .references('id')
        .inTable('Teacher')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['calendarSlotId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
