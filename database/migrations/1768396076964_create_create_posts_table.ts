import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 12).notNullable().unique()
      table.text('content').notNullable()
      table.string('user_id', 12).notNullable().references('id').inTable('users')
      table.string('school_id', 12).nullable().references('id').inTable('schools')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['uuid'])
      table.index(['user_id'])
      table.index(['school_id'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
