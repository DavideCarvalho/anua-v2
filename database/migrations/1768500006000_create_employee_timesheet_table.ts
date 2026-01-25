import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EmployeeTimesheet'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('timesheetId')
        .notNullable()
        .references('id')
        .inTable('Timesheet')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.specificType('status', '"TimesheetStatus"').notNullable().defaultTo('OPEN')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.timestamp('closedAt').nullable()
      table.text('observations').nullable()
      table.unique(['timesheetId', 'userId'])
      table.index(['timesheetId'])
      table.index(['userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
