import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contract_payment_days'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('contract_id')
        .notNullable()
        .references('id')
        .inTable('contracts')
        .onDelete('CASCADE')
      table.integer('day').notNullable() // 1-31

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.unique(['contract_id', 'day'])
      table.index(['contract_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
