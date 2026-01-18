import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'responsible_user_accepted_occurrences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('occurrence_id', 12)
        .notNullable()
        .references('id')
        .inTable('occurrences')
        .onDelete('CASCADE')
      table
        .string('responsible_user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['occurrence_id', 'responsible_user_id'])
      table.index(['occurrence_id'])
      table.index(['responsible_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
