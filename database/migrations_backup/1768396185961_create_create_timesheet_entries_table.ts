import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'timesheet_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('employee_timesheet_id')
        .notNullable()
        .references('id')
        .inTable('employee_timesheets')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.boolean('worked').defaultTo(true)
      table.time('entry_time').nullable()
      table.time('exit_time').nullable()
      table.text('observations').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['employee_timesheet_id', 'date'])
      table.index(['employee_timesheet_id'])
      table.index(['date'])
      table.index(['worked'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
