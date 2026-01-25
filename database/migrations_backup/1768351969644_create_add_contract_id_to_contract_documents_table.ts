import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contract_documents'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('contract_id')
        .nullable()
        .references('id')
        .inTable('contracts')
        .onDelete('CASCADE')
      table.index(['contract_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_id')
    })
  }
}
