import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ContractPaymentDay'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('day').notNullable()
      table.unique(['contractId', 'day'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
