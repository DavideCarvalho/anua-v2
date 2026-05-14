import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('ai_tool_calls', (table) => {
      table.uuid('id').primary()
      table.uuid('threadId').notNullable()
      table.uuid('messageId').nullable()
      table.uuid('userId').notNullable()
      table.uuid('schoolId').nullable()

      table.string('toolName', 100).notNullable()
      // 'read' = auto-executed, no approval needed.
      // 'action' = destructive, needs approval before running (futuro).
      table.string('toolKind', 16).notNullable().defaultTo('read')

      // 'auto_executed' (read), 'pending_approval' (action emitida, esperando
      // decisão), 'executed', 'rejected', 'failed'. Mantém o mesmo
      // vocabulário do flip-nestjs.
      table.string('status', 32).notNullable()

      table.jsonb('input').nullable()
      table.jsonb('output').nullable()
      table.text('error').nullable()
      table.integer('executionMs').nullable()

      // Quem aprovou/rejeitou (null pra read tools).
      table.uuid('decidedByUserId').nullable()
      table.timestamp('decidedAt', { useTz: true }).nullable()

      table.timestamp('createdAt', { useTz: true }).notNullable()

      table.index(['threadId', 'createdAt'])
      table.index(['userId', 'createdAt'])
      table.index(['toolKind', 'status'])
      table.index(['schoolId', 'createdAt'])
    })
  }

  async down() {
    this.schema.dropTableIfExists('ai_tool_calls')
  }
}
