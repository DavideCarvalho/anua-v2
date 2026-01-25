import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.string('store_item_id', 12).notNullable().references('id').inTable('store_items')
      table.string('school_id', 12).notNullable().references('id').inTable('schools')
      table.integer('quantity').defaultTo(1)
      table.integer('points_cost').notNullable()
      table.integer('total_points_cost').notNullable()
      table
        .enum('status', [
          'PENDING',
          'APPROVED',
          'PREPARING',
          'READY',
          'DELIVERED',
          'CANCELLED',
          'REJECTED',
        ])
        .defaultTo('PENDING')
      table.string('approved_by', 12).nullable().references('id').inTable('users')
      table.string('prepared_by', 12).nullable().references('id').inTable('users')
      table.string('delivered_by', 12).nullable().references('id').inTable('users')
      table.timestamp('approved_at').nullable()
      table.timestamp('prepared_at').nullable()
      table.timestamp('delivered_at').nullable()
      table.timestamp('cancelled_at').nullable()
      table.text('notes').nullable()
      table.text('rejection_reason').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(['store_item_id'])
      table.index(['school_id'])
      table.index(['status'])
      table.index(['approved_by'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
