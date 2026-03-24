import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryMessage'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('inquiryId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiry')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('authorId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('authorType').notNullable()
      table.text('body').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['inquiryId'])
      table.index(['authorId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
