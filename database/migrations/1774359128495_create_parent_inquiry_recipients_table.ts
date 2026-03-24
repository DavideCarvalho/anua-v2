import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryRecipient'

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
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('userType').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['inquiryId'])
      table.index(['userId'])
      table.unique(['inquiryId', 'userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
