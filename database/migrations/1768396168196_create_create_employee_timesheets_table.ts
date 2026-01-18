import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_timesheets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('timesheet_id')
        .notNullable()
        .references('id')
        .inTable('timesheets')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enum('status', ['OPEN', 'CLOSED']).defaultTo('OPEN')
      table.timestamp('closed_at').nullable()
      table.text('observations').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['timesheet_id', 'user_id'])
      table.index(['timesheet_id'])
      table.index(['user_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
