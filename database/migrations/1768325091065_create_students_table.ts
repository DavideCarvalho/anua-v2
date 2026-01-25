import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'students'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Same ID as user (1:1 relationship)
      table.uuid('id').primary().references('id').inTable('users').onDelete('CASCADE')

      table.integer('discount_percentage').defaultTo(0)
      table.integer('monthly_payment_amount').defaultTo(0)
      table.boolean('is_self_responsible').defaultTo(false)
      table.integer('payment_date').nullable()
      table.uuid('class_id').nullable()
      table.uuid('contract_id').nullable()
      table.float('canteen_limit').nullable()
      table.integer('balance').defaultTo(0) // Balance in cents for canteen and store

      table
        .enum('enrollment_status', ['PENDING_DOCUMENT_REVIEW', 'REGISTERED'])
        .defaultTo('PENDING_DOCUMENT_REVIEW')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
