import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'canteens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.string('responsible_user_id', 12).notNullable().references('id').inTable('users')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['responsible_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
