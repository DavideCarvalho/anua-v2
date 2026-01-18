import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 12).notNullable().unique()
      table.integer('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
      table.text('comment').notNullable()
      table.string('user_id', 12).notNullable().references('id').inTable('users')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['uuid'])
      table.index(['post_id'])
      table.index(['user_id'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
