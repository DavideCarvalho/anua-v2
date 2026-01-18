import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_benefits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.decimal('value', 10, 2).notNullable()
      table.string('description').nullable()
      table.decimal('deduction_percentage', 5, 2).defaultTo(0) // 0-100%
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
