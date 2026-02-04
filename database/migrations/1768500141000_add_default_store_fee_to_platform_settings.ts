import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PlatformSettings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('defaultStorePlatformFeePercentage', 8).notNullable().defaultTo(5.0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('defaultStorePlatformFeePercentage')
    })
  }
}
