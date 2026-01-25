import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_has_school_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .uuid('school_group_id')
        .notNullable()
        .references('id')
        .inTable('school_groups')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'school_group_id'])
      table.index(['user_id'])
      table.index(['school_group_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
