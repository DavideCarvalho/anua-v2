import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TimesheetEntry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('employeeTimesheetId')
        .notNullable()
        .references('id')
        .inTable('EmployeeTimesheet')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.date('date').notNullable()
      table.boolean('worked').notNullable().defaultTo(true)
      table.time('entryTime').nullable()
      table.time('exitTime').nullable()
      table.text('observations').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['employeeTimesheetId', 'date'])
      table.index(['employeeTimesheetId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
