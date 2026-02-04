import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreInstallmentRule'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('storeId')
        .notNullable()
        .references('id')
        .inTable('Store')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.integer('minAmount').notNullable()
      table.integer('maxInstallments').notNullable()
      table.boolean('isActive').notNullable().defaultTo(true)

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['storeId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
