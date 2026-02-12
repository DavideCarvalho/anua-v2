import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Event'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('additionalCostInstallments').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('additionalCostInstallments')
    })
  }
}
