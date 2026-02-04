import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.specificType('type', '"InvoiceType"').notNullable()
      table.integer('month').nullable()
      table.integer('year').nullable()
      table.date('dueDate').notNullable()
      table.specificType('status', '"InvoiceStatus"').notNullable().defaultTo('OPEN')
      table.integer('totalAmount').notNullable()
      table.integer('netAmountReceived').nullable()
      table.timestamp('paidAt').nullable()
      table.text('paymentMethod').nullable()
      table.text('paymentGatewayId').nullable().unique()
      table.text('paymentGateway').nullable()
      table.text('observation').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['studentId', 'month', 'year'])
      table.index(['contractId'])
      table.index(['status'])
      table.index(['paymentGatewayId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
