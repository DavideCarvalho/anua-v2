import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Agreement'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.integer('totalAmount').notNullable()
      table.integer('installments').notNullable().defaultTo(1)
      table.date('startDate').notNullable()
      table.integer('paymentDay').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
