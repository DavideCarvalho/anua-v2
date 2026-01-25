import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('role_id').references('id').inTable('roles').onDelete('SET NULL')
      table.foreign('school_id').references('id').inTable('schools').onDelete('SET NULL')
      table
        .foreign('school_chain_id')
        .references('id')
        .inTable('school_chains')
        .onDelete('SET NULL')
      table.foreign('deleted_by').references('id').inTable('users').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['role_id'])
      table.dropForeign(['school_id'])
      table.dropForeign(['school_chain_id'])
      table.dropForeign(['deleted_by'])
    })
  }
}
