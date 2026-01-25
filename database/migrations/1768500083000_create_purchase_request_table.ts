import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PurchaseRequest'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('productName').notNullable()
      table.integer('quantity').notNullable()
      table.integer('finalQuantity').nullable()
      table.text('status').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.text('proposal').nullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('dueDate').notNullable()
      table.float('value', 8).notNullable()
      table.float('unitValue', 8).notNullable()
      table.float('finalUnitValue', 8).nullable()
      table.float('finalValue', 8).nullable()
      table.text('description').nullable()
      table.string('productUrl', 1000).nullable()
      table.timestamp('purchaseDate').nullable()
      table.timestamp('estimatedArrivalDate').nullable()
      table.timestamp('arrivalDate').nullable()
      table.text('rejectionReason').nullable()
      table
        .text('requestingUserId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('receiptPath').nullable()
      table.index(['requestingUserId'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
