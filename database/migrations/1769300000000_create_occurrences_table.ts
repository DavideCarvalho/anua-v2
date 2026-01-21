import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'occurrences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('student_id').notNullable().references('id').inTable('students').onDelete('CASCADE')
      table
        .uuid('reported_by')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.uuid('resolved_by').nullable().references('id').inTable('users').onDelete('SET NULL')

      table
        .enum('type', ['BEHAVIORAL', 'ACADEMIC', 'HEALTH', 'ATTENDANCE', 'OTHER'], {
          useNative: true,
          enumName: 'occurrence_type',
          existingType: false,
        })
        .notNullable()
        .defaultTo('BEHAVIORAL')

      table
        .enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
          useNative: true,
          enumName: 'occurrence_severity',
          existingType: false,
        })
        .notNullable()
        .defaultTo('LOW')

      table
        .enum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'], {
          useNative: true,
          enumName: 'occurrence_status',
          existingType: false,
        })
        .notNullable()
        .defaultTo('OPEN')

      table.string('title', 255).notNullable()
      table.text('description').notNullable()
      table.text('resolution_notes').nullable()
      table.date('occurrence_date').notNullable()
      table.timestamp('resolved_at').nullable()

      // Whether the responsible (parent) has been notified
      table.boolean('responsible_notified').notNullable().defaultTo(false)
      table.timestamp('responsible_notified_at').nullable()

      // Whether the responsible has acknowledged the occurrence
      table.boolean('responsible_acknowledged').notNullable().defaultTo(false)
      table.timestamp('responsible_acknowledged_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['student_id'])
      table.index(['reported_by'])
      table.index(['status'])
      table.index(['type'])
      table.index(['severity'])
      table.index(['occurrence_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS occurrence_type')
    this.schema.raw('DROP TYPE IF EXISTS occurrence_severity')
    this.schema.raw('DROP TYPE IF EXISTS occurrence_status')
  }
}
