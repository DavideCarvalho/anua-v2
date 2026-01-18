import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('user_id', 12).notNullable().references('id').inTable('users')
      table.string('action').notNullable()
      table.string('entity').notNullable()
      table.string('entity_id', 12).notNullable()
      table.json('details').nullable()
      table.timestamp('created_at')

      table.index(['entity', 'entity_id'])
      table.index(['user_id', 'created_at'])
      table.index(['action'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
