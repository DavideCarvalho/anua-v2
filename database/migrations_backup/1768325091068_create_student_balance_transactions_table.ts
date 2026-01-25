import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_balance_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.integer('amount').notNullable() // Value in cents (positive = credit, negative = debit)

      table
        .enum('type', [
          'TOP_UP', // Credit recharge
          'CANTEEN_PURCHASE', // Canteen purchase
          'STORE_PURCHASE', // Gamification store purchase
          'REFUND', // Refund
          'ADJUSTMENT', // Manual adjustment
        ])
        .notNullable()

      table
        .enum('status', [
          'PENDING', // Awaiting payment (for recharges)
          'COMPLETED', // Completed
          'FAILED', // Failed
          'CANCELLED', // Cancelled
        ])
        .defaultTo('COMPLETED')

      table.string('description').nullable()
      table.integer('previous_balance').notNullable()
      table.integer('new_balance').notNullable()

      // Optional references
      table.uuid('canteen_purchase_id').nullable()
      table.uuid('store_order_id').nullable()
      table.uuid('responsible_id').nullable().references('id').inTable('users').onDelete('SET NULL')

      // Payment gateway (for online recharges)
      table.string('payment_gateway_id').nullable()
      table.string('payment_method').nullable() // PIX, CREDIT_CARD, BOLETO

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['student_id', 'created_at'])
      table.index(['type', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
