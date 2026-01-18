import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subjects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.string('slug').notNullable()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.integer('quantity_needed_scheduled').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
