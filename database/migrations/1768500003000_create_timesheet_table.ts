import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Timesheet'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('name').notNullable()
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.specificType('status', '"TimesheetStatus"').notNullable().defaultTo('OPEN')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.timestamp('closedAt').nullable()
      table.unique(['schoolId', 'month', 'year'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
