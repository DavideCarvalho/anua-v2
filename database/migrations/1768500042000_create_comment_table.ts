import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Comment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.text('uuid').notNullable()
      table
        .integer('postId')
        .notNullable()
        .references('id')
        .inTable('Post')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('comment').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.index(['uuid'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
