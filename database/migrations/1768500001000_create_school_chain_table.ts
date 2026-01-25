import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolChain'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable()
      table
        .specificType('subscriptionLevel', '"SubscriptionLevel"')
        .notNullable()
        .defaultTo('INDIVIDUAL')
      table.text('asaasAccountId').nullable()
      table.text('asaasWebhookToken').nullable()
      table.text('asaasWalletId').nullable()
      table.text('asaasApiKey').nullable()
      table.boolean('allowSchoolsToOverridePaymentConfig').notNullable().defaultTo(false)
      table.boolean('allowSchoolsToOverrideNotifications').notNullable().defaultTo(true)
      table.boolean('usePlatformManagedPayments').notNullable().defaultTo(false)
      table.boolean('enablePaymentNotifications').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.boolean('hasInsuranceByDefault').notNullable().defaultTo(false)
      table.float('insurancePercentage', 8).nullable()
      table.float('insuranceCoveragePercentage', 8).nullable().defaultTo(100.0)
      table.integer('insuranceClaimWaitingDays').nullable().defaultTo(90)
      table.index(['asaasAccountId'])
      table.index(['asaasWalletId'])
      table.index(['asaasWebhookToken'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
