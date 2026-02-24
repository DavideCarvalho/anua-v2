import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionInvoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('chargeRetryCount').notNullable().defaultTo(0)
      table.timestamp('nextChargeRetryAt').nullable()
      table.timestamp('lastChargeAttemptAt').nullable()
      table.text('lastChargeError').nullable()
      table.text('collectionStatus').notNullable().defaultTo('PENDING')

      table.index(['collectionStatus'])
      table.index(['nextChargeRetryAt'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['nextChargeRetryAt'])
      table.dropIndex(['collectionStatus'])

      table.dropColumn('collectionStatus')
      table.dropColumn('lastChargeError')
      table.dropColumn('lastChargeAttemptAt')
      table.dropColumn('nextChargeRetryAt')
      table.dropColumn('chargeRetryCount')
    })
  }
}
