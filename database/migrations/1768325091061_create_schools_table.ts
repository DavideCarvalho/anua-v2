import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schools'

  async up() {
    // Enum for payment config status
    this.schema.raw(`
      CREATE TYPE payment_config_status AS ENUM (
        'NOT_CONFIGURED',
        'PENDING_DOCUMENTS',
        'PENDING_APPROVAL',
        'ACTIVE',
        'EXPIRING_SOON',
        'EXPIRED',
        'REJECTED'
      )
    `)

    // Enum for PIX key type
    this.schema.raw(`
      CREATE TYPE pix_key_type AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()

      // Address
      table.string('street').nullable()
      table.string('number').nullable()
      table.string('complement').nullable()
      table.string('neighborhood').nullable()
      table.string('city').nullable()
      table.string('state').nullable()
      table.string('zip_code').nullable()
      table.float('latitude').nullable()
      table.float('longitude').nullable()

      // Logo
      table.string('logo_url').nullable()

      // Asaas integration
      table.string('asaas_account_id').nullable()
      table.string('asaas_webhook_token').nullable()
      table.string('asaas_wallet_id').nullable()
      table.string('asaas_api_key').nullable()
      table.string('asaas_document_url').nullable()
      table.boolean('asaas_commercial_info_is_expired').nullable()
      table.timestamp('asaas_commercial_info_scheduled_date').nullable()

      // Payment config
      table
        .specificType('payment_config_status', 'payment_config_status')
        .notNullable()
        .defaultTo('NOT_CONFIGURED')
      table.timestamp('payment_config_status_updated_at').nullable()
      table.string('pix_key').nullable()
      table.specificType('pix_key_type', 'pix_key_type').nullable()
      table.boolean('use_platform_managed_payments').defaultTo(false)
      table.boolean('enable_payment_notifications').defaultTo(true)

      // Academic settings
      table.float('minimum_grade').defaultTo(6)
      table.string('calculation_algorithm').defaultTo('AVERAGE')
      table.float('minimum_attendance_percentage').defaultTo(75)

      // Insurance config (overrides SchoolChain)
      table.boolean('has_insurance').nullable()
      table.float('insurance_percentage').nullable()
      table.float('insurance_coverage_percentage').nullable()
      table.integer('insurance_claim_waiting_days').nullable()

      // Foreign keys
      table.uuid('school_chain_id').nullable().references('id').inTable('school_chains').onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['id'])
      table.index(['school_chain_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS payment_config_status')
    this.schema.raw('DROP TYPE IF EXISTS pix_key_type')
  }
}
