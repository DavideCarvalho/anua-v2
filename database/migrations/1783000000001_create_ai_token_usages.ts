import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('ai_token_usages', (table) => {
      table.uuid('id').primary()
      table
        .uuid('thread_id')
        .notNullable()
        .references('id')
        .inTable('ai_threads')
        .onDelete('CASCADE')
      table
        .uuid('message_id')
        .nullable()
        .references('id')
        .inTable('ai_thread_messages')
        .onDelete('SET NULL')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('school_id').nullable().references('id').inTable('schools').onDelete('SET NULL')
      table.string('model').notNullable()
      table.string('purpose').notNullable()
      table.integer('input_tokens').notNullable().defaultTo(0)
      table.integer('output_tokens').notNullable().defaultTo(0)
      table.integer('total_tokens').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['thread_id'])
      table.index(['user_id', 'created_at'])
      table.index(['school_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTableIfExists('ai_token_usages')
  }
}
