import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentPayment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('discountType').notNullable().defaultTo('PERCENTAGE')
      table.integer('discountValue').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('discountType')
      table.dropColumn('discountValue')
    })
  }
}
