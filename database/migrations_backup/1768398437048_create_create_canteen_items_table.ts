import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteen_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('canteen_id', 12)
        .notNullable()
        .references('id')
        .inTable('canteens')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.integer('price').notNullable() // Em centavos
      table.string('category').nullable()
      table.boolean('is_active').defaultTo(true)
      table.string('image_url').nullable()
      table.integer('stock_quantity').nullable() // null = ilimitado
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['canteen_id'])
      table.index(['category'])
      table.index(['is_active'])
      table.index(['price'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
