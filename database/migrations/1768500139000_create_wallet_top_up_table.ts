import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'WalletTopUp'

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
        .text('responsibleUserId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.integer('amount').notNullable()
      table.specificType('status', '"WalletTopUpStatus"').notNullable().defaultTo('PENDING')
      table.text('paymentGateway').notNullable().defaultTo('ASAAS')
      table.text('paymentGatewayId').nullable().unique()
      table.text('paymentMethod').nullable()
      table.timestamp('paidAt').nullable()

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['studentId'])
      table.index(['responsibleUserId'])
      table.index(['status'])
      table.index(['paymentGatewayId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
