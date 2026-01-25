import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ContractInterestConfig'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
        .unique()
      table.integer('delayInterestPercentage').notNullable().defaultTo(20)
      table.integer('delayInterestPerDayDelayed').notNullable().defaultTo(33)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
