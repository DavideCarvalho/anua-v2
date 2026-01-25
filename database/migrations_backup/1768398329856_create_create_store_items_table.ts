import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.string('canteen_item_id', 12).nullable().references('id').inTable('canteen_items') // Pode ser item da cantina
      table.string('name').notNullable()
      table.text('description').nullable()
      table.integer('points_cost').notNullable()
      table.string('image_url').nullable()
      table
        .enum('type', [
          'PHYSICAL_ITEM',
          'CANTEEN_ITEM',
          'PRIVILEGE',
          'VIRTUAL_REWARD',
          'EXPERIENCE',
        ])
        .notNullable()
      table.integer('stock_quantity').nullable() // null = ilimitado
      table.boolean('is_active').defaultTo(true)
      table.json('metadata').nullable() // Dados específicos do tipo de item
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['canteen_item_id'])
      table.index(['type'])
      table.index(['is_active'])
      table.index(['points_cost'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
