import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreInstallmentRule'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('minAmount', 'minInstallmentAmount')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('minInstallmentAmount', 'minAmount')
    })
  }
}
