import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_groups'

  async up() {
    // Enum for school group type
    this.schema.raw(`
      CREATE TYPE school_group_type AS ENUM ('CITY', 'STATE', 'CUSTOM')
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.specificType('type', 'school_group_type').notNullable()
      table.boolean('is_auto_generated').defaultTo(false)

      // Insurance config (can override SchoolChain)
      table.boolean('has_insurance').nullable()
      table.float('insurance_percentage').nullable()
      table.float('insurance_coverage_percentage').nullable()
      table.integer('insurance_claim_waiting_days').nullable()

      // Foreign keys
      table.uuid('school_chain_id').notNullable().references('id').inTable('school_chains').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['school_chain_id'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS school_group_type')
  }
}
