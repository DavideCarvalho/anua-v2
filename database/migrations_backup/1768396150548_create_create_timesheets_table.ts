import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'timesheets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.string('name').notNullable()
      table.integer('month').notNullable()
      table.integer('year').notNullable()
      table.enum('status', ['OPEN', 'CLOSED']).defaultTo('OPEN')
      table.timestamp('closed_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_id', 'month', 'year'])
      table.index(['school_id'])
      table.index(['month', 'year'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
