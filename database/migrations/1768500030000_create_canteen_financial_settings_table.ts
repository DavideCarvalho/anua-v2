import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenFinancialSettings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .unique()
      table.float('platformFeePercentage', 8).notNullable().defaultTo(5.0)
      table.text('pixKey').nullable()
      table.specificType('pixKeyType', '"PixKeyType"').nullable()
      table.text('bankName').nullable()
      table.text('accountHolder').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['canteenId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
