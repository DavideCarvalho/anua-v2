import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Post'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.text('uuid').notNullable()
      table.text('content').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['uuid'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
