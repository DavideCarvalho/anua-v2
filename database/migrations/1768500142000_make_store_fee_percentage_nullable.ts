import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreFinancialSettings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('platformFeePercentage', 8).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('platformFeePercentage', 8).notNullable().defaultTo(0).alter()
    })
  }
}
