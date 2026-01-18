import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_has_schools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.boolean('is_default').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'school_id'])
      table.index(['user_id'])
      table.index(['school_id'])
      table.index(['is_default'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
