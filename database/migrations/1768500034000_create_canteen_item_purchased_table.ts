import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenItemPurchased'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.float('price', 8).notNullable()
      table.integer('quantity').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('canteenPurchaseId')
        .notNullable()
        .references('id')
        .inTable('CanteenPurchase')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('canteenItemId')
        .notNullable()
        .references('id')
        .inTable('CanteenItem')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
