import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreItem'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('storeId')
        .nullable()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('storeId')
    })
  }
}
