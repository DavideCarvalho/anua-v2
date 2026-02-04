import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Agreement'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('paymentMethod').nullable()
      table.text('billingType').notNullable().defaultTo('UPFRONT')
      table.integer('finePercentage').nullable().defaultTo(0)
      table.integer('dailyInterestPercentage').nullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('paymentMethod')
      table.dropColumn('billingType')
      table.dropColumn('finePercentage')
      table.dropColumn('dailyInterestPercentage')
    })
  }
}
