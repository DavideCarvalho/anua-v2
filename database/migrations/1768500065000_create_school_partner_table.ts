import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolPartner'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('cnpj').notNullable().unique()
      table.text('email').nullable()
      table.text('phone').nullable()
      table.text('contactName').nullable()
      table.float('discountPercentage', 8).notNullable().defaultTo(0)
      table.date('partnershipStartDate').notNullable()
      table.date('partnershipEndDate').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
