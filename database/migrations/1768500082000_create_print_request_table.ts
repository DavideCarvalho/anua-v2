import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PrintRequest'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('name').notNullable()
      table.text('path').notNullable()
      table.text('status').notNullable()
      table.boolean('frontAndBack').notNullable().defaultTo(false)
      table.text('rejectedFeedback').nullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.timestamp('dueDate').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
