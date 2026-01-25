import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_school_partners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table
        .uuid('school_partner_id')
        .notNullable()
        .references('id')
        .inTable('school_partners')
        .onDelete('CASCADE')
      table.uuid('user_id').nullable().references('id').inTable('users')
      table.string('academic_period_id', 12).notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['student_id', 'school_partner_id'])
      table.index(['student_id'])
      table.index(['school_partner_id'])
      table.index(['user_id'])
      table.index(['academic_period_id'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
