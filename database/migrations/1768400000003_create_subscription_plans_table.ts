import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_plans'

  async up() {
    // Enum for subscription tier
    this.schema.raw(`
      CREATE TYPE subscription_tier AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.specificType('tier', 'subscription_tier').notNullable()
      table.text('description').nullable()
      table.integer('monthly_price').notNullable() // in cents
      table.integer('annual_price').nullable() // discounted annual price in cents
      table.integer('max_students').nullable() // null = unlimited
      table.integer('max_teachers').nullable()
      table.integer('max_schools_in_chain').nullable()
      table.jsonb('features').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['tier'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS subscription_tier')
  }
}
