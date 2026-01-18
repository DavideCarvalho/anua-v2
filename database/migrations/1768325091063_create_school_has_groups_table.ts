import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_has_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.uuid('school_group_id').notNullable().references('id').inTable('school_groups').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Unique constraint
      table.unique(['school_id', 'school_group_id'])

      // Indexes
      table.index(['school_id'])
      table.index(['school_group_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
