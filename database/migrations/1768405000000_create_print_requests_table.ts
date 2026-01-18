import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'print_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('path').notNullable()
      table.enum('status', ['REQUESTED', 'APPROVED', 'REJECTED', 'PRINTED', 'REVIEW']).notNullable()
      table.boolean('front_and_back').defaultTo(false)
      table.text('rejected_feedback').nullable()
      table.integer('quantity').defaultTo(1)
      table.date('due_date').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id'])
      table.index(['status'])
      table.index(['due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
