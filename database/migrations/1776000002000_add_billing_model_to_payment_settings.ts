import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PaymentSettings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('billingModel').notNullable().defaultTo('PER_ACTIVE_STUDENT')
      table.integer('monthlyFixedPrice').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('monthlyFixedPrice')
      table.dropColumn('billingModel')
    })
  }
}
