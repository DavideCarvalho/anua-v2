import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_usage_metrics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Foreign key
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')

      // Period
      table.integer('month').notNullable() // 1-12
      table.integer('year').notNullable()

      // Usage metrics
      table.integer('active_students').notNullable().defaultTo(0)
      table.integer('active_teachers').notNullable().defaultTo(0)
      table.integer('active_users').notNullable().defaultTo(0)
      table.integer('classes_created').notNullable().defaultTo(0)
      table.integer('assignments_created').notNullable().defaultTo(0)
      table.integer('attendance_records').notNullable().defaultTo(0)
      table.integer('total_revenue').notNullable().defaultTo(0) // in cents
      table.integer('total_enrollments').notNullable().defaultTo(0)
      table.integer('login_count').notNullable().defaultTo(0)
      table.timestamp('last_activity_at').nullable()

      table.timestamp('created_at').notNullable()

      // Unique constraint
      table.unique(['school_id', 'month', 'year'])

      // Indexes
      table.index(['school_id'])
      table.index(['month', 'year'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
