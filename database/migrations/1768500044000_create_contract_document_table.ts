import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ContractDocument'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('name').notNullable()
      table.text('description').nullable()
      table.boolean('required').notNullable().defaultTo(false)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
