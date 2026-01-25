import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .string('id', 12)
        .primary()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.float('hourly_rate').defaultTo(0)

      table.index(['id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
