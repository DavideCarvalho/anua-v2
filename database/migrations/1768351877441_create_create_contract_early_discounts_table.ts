import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contract_early_discounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('contract_id')
        .notNullable()
        .references('id')
        .inTable('contracts')
        .onDelete('CASCADE')
      table.integer('percentage').notNullable() // Percentual de desconto
      table.integer('days_before_deadline').notNullable() // Quantos dias antes do vencimento

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index
      table.index(['contract_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
