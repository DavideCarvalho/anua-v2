import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ExtraClassAttendance'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('extraClassId')
        .notNullable()
        .references('id')
        .inTable('ExtraClass')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('extraClassScheduleId')
        .notNullable()
        .references('id')
        .inTable('ExtraClassSchedule')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.timestamp('date').notNullable()
      table.text('note').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['extraClassId'])
      table.index(['extraClassScheduleId'])
      table.index(['date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
