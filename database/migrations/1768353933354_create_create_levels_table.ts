import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'levels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.integer('order').notNullable()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.string('contract_id', 12).nullable().references('id').inTable('contracts')
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_id', 'slug'])
      table.index(['school_id'])
      table.index(['contract_id'])
      table.index(['order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
