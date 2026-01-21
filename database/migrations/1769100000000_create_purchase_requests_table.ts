import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table
        .uuid('requesting_user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('product_name').notNullable()
      table.integer('quantity').notNullable()
      table.integer('final_quantity').nullable()
      table
        .enum('status', ['REQUESTED', 'APPROVED', 'REJECTED', 'BOUGHT', 'ARRIVED'])
        .notNullable()
        .defaultTo('REQUESTED')
      table.text('proposal').nullable()
      table.date('due_date').notNullable()
      table.decimal('value', 12, 2).notNullable()
      table.decimal('unit_value', 12, 2).notNullable()
      table.decimal('final_unit_value', 12, 2).nullable()
      table.decimal('final_value', 12, 2).nullable()
      table.text('description').nullable()
      table.string('product_url', 1000).nullable()
      table.date('purchase_date').nullable()
      table.date('estimated_arrival_date').nullable()
      table.date('arrival_date').nullable()
      table.text('rejection_reason').nullable()
      table.string('receipt_path').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['requesting_user_id'])
      table.index(['status'])
      table.index(['due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
