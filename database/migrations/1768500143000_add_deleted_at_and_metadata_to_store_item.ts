import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreItem'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deletedAt').nullable()
      table.jsonb('metadata').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('deletedAt')
      table.dropColumn('metadata')
    })
  }
}
