import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('ai_threads', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').nullable()
      table.string('persona').nullable()
      table.uuid('school_id').nullable().references('id').inTable('schools').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable('ai_thread_messages', (table) => {
      table.uuid('id').primary()
      table.uuid('thread_id').notNullable().references('id').inTable('ai_threads').onDelete('CASCADE')
      table.string('role').notNullable()
      table.text('content').notNullable()
      table.jsonb('tool_calls').nullable()
      table.jsonb('tool_results').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTableIfExists('ai_thread_messages')
    this.schema.dropTableIfExists('ai_threads')
  }
}
