import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'achievements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('school_id', 12).nullable().references('id').inTable('schools') // null = global achievement
      table.string('school_chain_id', 12).nullable().references('id').inTable('school_chains') // null = school-specific
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.string('icon_url').nullable()
      table.string('badge_color').nullable()
      table
        .enum('type', [
          'ACADEMIC_PERFORMANCE',
          'ATTENDANCE',
          'BEHAVIOR',
          'PARTICIPATION',
          'STREAK',
          'SOCIAL',
          'SPECIAL',
        ])
        .notNullable()
      table.json('criteria').notNullable() // Critérios para unlock
      table.integer('points_reward').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_repeatable').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['school_chain_id'])
      table.index(['type'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
