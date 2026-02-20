import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AgreementEarlyDiscount'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('discountType').notNullable().defaultTo('PERCENTAGE')
      table.integer('flatAmount').nullable()
      table.integer('percentage').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('percentage').notNullable().alter()
      table.dropColumn('flatAmount')
      table.dropColumn('discountType')
    })
  }
}
