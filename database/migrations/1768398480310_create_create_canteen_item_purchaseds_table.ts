import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_item_purchased'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('canteen_purchase_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteen_purchases')
        .onDelete('CASCADE')
      table
        .string('canteen_item_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteen_items')
        .onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.integer('unit_price').notNullable() // Preço unitário na hora da compra
      table.integer('total_price').notNullable() // quantity * unit_price
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['canteen_purchase_id'])
      table.index(['canteen_item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
