import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'classes'

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
      table.string('level_id', 12).nullable().references('id').inTable('levels')
      table.boolean('is_archived').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['level_id'])
      table.index(['is_archived'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
