import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenItem'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('description').nullable()
      table.integer('price').notNullable()
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('category').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['canteenId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
