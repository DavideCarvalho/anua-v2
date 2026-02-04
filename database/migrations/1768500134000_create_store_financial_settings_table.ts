import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreFinancialSettings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('storeId')
        .notNullable()
        .unique()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.float('platformFeePercentage', 8).notNullable().defaultTo(0)
      table.text('pixKey').nullable()
      table.text('pixKeyType').nullable()
      table.text('bankName').nullable()
      table.text('accountHolder').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
