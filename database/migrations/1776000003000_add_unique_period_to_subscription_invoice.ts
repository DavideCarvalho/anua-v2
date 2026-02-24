import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionInvoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['subscriptionId', 'month', 'year'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['subscriptionId', 'month', 'year'])
    })
  }
}
