import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryReadStatus'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('inquiryId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiry')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.timestamp('lastReadAt').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.unique(['userId', 'inquiryId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
