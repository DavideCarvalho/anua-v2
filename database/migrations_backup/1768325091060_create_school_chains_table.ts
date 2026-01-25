import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_chains'

  async up() {
    // Enum for subscription level
    this.schema.raw(`
      CREATE TYPE subscription_level AS ENUM ('NETWORK', 'INDIVIDUAL')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()

      // Subscription
      table
        .specificType('subscription_level', 'subscription_level')
        .notNullable()
        .defaultTo('INDIVIDUAL')

      // Asaas integration
      table.string('asaas_account_id').nullable()
      table.string('asaas_webhook_token').nullable()
      table.string('asaas_wallet_id').nullable()
      table.string('asaas_api_key').nullable()

      // Payment config
      table.boolean('allow_schools_to_override_payment_config').defaultTo(false)
      table.boolean('allow_schools_to_override_notifications').defaultTo(true)
      table.boolean('use_platform_managed_payments').defaultTo(false)
      table.boolean('enable_payment_notifications').defaultTo(true)

      // Insurance config
      table.boolean('has_insurance_by_default').defaultTo(false)
      table.float('insurance_percentage').nullable()
      table.float('insurance_coverage_percentage').nullable().defaultTo(100.0)
      table.integer('insurance_claim_waiting_days').nullable().defaultTo(90)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['asaas_account_id'])
      table.index(['asaas_webhook_token'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS subscription_level')
  }
}
