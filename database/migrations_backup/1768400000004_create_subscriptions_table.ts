import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    // Enum for subscription status
    this.schema.raw(`
      CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'BLOCKED', 'CANCELED', 'PAUSED')
    `)

    // Enum for billing cycle
    this.schema.raw(`
      CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Plan reference
      table
        .uuid('plan_id')
        .nullable()
        .references('id')
        .inTable('subscription_plans')
        .onDelete('SET NULL')

      // Entity references - one of these must be set
      table
        .uuid('school_id')
        .nullable()
        .unique()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table
        .uuid('school_chain_id')
        .nullable()
        .unique()
        .references('id')
        .inTable('school_chains')
        .onDelete('CASCADE')

      // Status and billing
      table.specificType('status', 'subscription_status').notNullable().defaultTo('TRIAL')
      table.specificType('billing_cycle', 'billing_cycle').notNullable().defaultTo('MONTHLY')

      // Period dates
      table.date('current_period_start').notNullable()
      table.date('current_period_end').notNullable()
      table.date('trial_ends_at').nullable()
      table.timestamp('canceled_at').nullable()
      table.timestamp('paused_at').nullable()
      table.timestamp('blocked_at').nullable()

      // Pricing
      table.integer('price_per_student').notNullable() // in cents
      table.integer('active_students').notNullable().defaultTo(0)
      table.integer('monthly_amount').notNullable().defaultTo(0) // in cents
      table.integer('discount').notNullable().defaultTo(0) // percentage

      // Payment gateway info
      table.string('payment_gateway_id').nullable()
      table.string('payment_method').nullable()
      table.string('credit_card_token').nullable()
      table.string('credit_card_holder_name').nullable()
      table.string('credit_card_last_four_digits').nullable()
      table.string('credit_card_brand').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['plan_id'])
      table.index(['school_id'])
      table.index(['school_chain_id'])
      table.index(['status'])
      table.index(['billing_cycle'])
      table.index(['current_period_end'])
      table.index(['trial_ends_at'])
      table.index(['payment_gateway_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS subscription_status')
    this.schema.raw('DROP TYPE IF EXISTS billing_cycle')
  }
}
