import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'courses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table
        .string('school_id', 12)
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table.integer('version').defaultTo(1)
      table.string('coordinator_id', 12).nullable().references('id').inTable('users')

      // Course configuration
      table.integer('enrollment_minimum_age').nullable()
      table.integer('enrollment_maximum_age').nullable()
      table.integer('max_students_per_class').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_id', 'slug', 'version'])
      table.index(['school_id'])
      table.index(['coordinator_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
