import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Absence'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.date('date').notNullable()
      table.specificType('reason', '"AbsenceReason"').notNullable()
      table.specificType('status', '"AbsenceStatus"').notNullable().defaultTo('PENDING')
      table.text('description').nullable()
      table.text('rejectionReason').nullable()
      table.boolean('isExcused').notNullable().defaultTo(false)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('timesheetEntryId')
        .nullable()
        .references('id')
        .inTable('TimesheetEntry')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['date'])
      table.index(['timesheetEntryId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
