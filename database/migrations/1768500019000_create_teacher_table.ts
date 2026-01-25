import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Teacher'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .text('id')
        .primary()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.float('hourlyRate', 8).notNullable().defaultTo(0)
      table.index(['id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
