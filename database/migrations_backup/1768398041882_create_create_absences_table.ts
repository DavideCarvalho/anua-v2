import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'absences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.date('date').notNullable()
      table
        .enum('reason', [
          'SICKNESS',
          'PERSONAL_MATTERS',
          'BLOOD_DONATION',
          'ELECTION_JUDGE',
          'VACATION',
          'DAYOFF',
          'OTHER',
        ])
        .notNullable()
      table.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING')
      table.text('description').nullable()
      table.text('rejection_reason').nullable()
      table.boolean('is_excused').defaultTo(false)
      table.uuid('timesheet_entry_id').nullable().references('id').inTable('timesheet_entries')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id'])
      table.index(['date'])
      table.index(['status'])
      table.index(['timesheet_entry_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
