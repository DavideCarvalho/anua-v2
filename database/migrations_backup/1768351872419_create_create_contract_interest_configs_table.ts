import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contract_interest_configs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('contract_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('contracts')
        .onDelete('CASCADE')
      table.integer('delay_interest_percentage').defaultTo(20) // Percentual de juros
      table.integer('delay_interest_per_day_delayed').defaultTo(33) // Juros por dia de atraso

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
