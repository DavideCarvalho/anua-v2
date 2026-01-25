import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CalendarSlot'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('teacherHasClassId')
        .nullable()
        .references('id')
        .inTable('TeacherHasClass')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.integer('classWeekDay').notNullable()
      table.time('startTime').notNullable()
      table.time('endTime').notNullable()
      table.integer('minutes').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('calendarId')
        .notNullable()
        .references('id')
        .inTable('Calendar')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.boolean('isBreak').notNullable().defaultTo(false)
      table.unique(['calendarId', 'teacherHasClassId', 'classWeekDay', 'startTime'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
