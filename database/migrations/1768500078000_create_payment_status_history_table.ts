import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PaymentStatusHistory'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('paymentId')
        .notNullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.specificType('previousStatus', '"PaymentStatus"').notNullable()
      table.specificType('newStatus', '"PaymentStatus"').notNullable()
      table
        .text('changedBy')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('changedAt').notNullable().defaultTo(this.now())
      table.text('observation').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
