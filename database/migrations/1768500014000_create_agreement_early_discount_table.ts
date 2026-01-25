import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AgreementEarlyDiscount'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('agreementId')
        .notNullable()
        .references('id')
        .inTable('Agreement')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('percentage').notNullable()
      table.integer('daysBeforeDeadline').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['agreementId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
