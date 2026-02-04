import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentPayment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('invoiceId')
        .nullable()
        .references('id')
        .inTable('Invoice')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invoiceId')
    })
  }
}
