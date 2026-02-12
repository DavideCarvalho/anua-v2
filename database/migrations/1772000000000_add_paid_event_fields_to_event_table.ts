import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Event'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('hasAdditionalCosts').notNullable().defaultTo(false)
      table.integer('additionalCostAmount').nullable()
      table.text('additionalCostDescription').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('additionalCostDescription')
      table.dropColumn('additionalCostAmount')
      table.dropColumn('hasAdditionalCosts')
    })
  }
}
