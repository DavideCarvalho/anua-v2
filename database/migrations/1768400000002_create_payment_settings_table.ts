import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.integer('price_per_student').notNullable() // in cents
      table.integer('trial_days').notNullable().defaultTo(30)
      table.integer('discount').notNullable().defaultTo(0) // percentage 0-100
      table.decimal('platform_fee_percentage', 5, 2).notNullable().defaultTo(5.0) // fee on student payments
      table.boolean('is_active').notNullable().defaultTo(true)

      // Foreign keys - one of these must be set (school or chain)
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

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['school_id'])
      table.index(['school_chain_id'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
