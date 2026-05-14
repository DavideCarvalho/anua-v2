import { BaseSchema } from '@adonisjs/lucid/schema'

// Stores the AI SDK toolCallId (string vindo do streamText) ao lado do nosso
// PK em uuidv7. Sem isso, o frontend não consegue mapear a parte
// `input-available` da UIMessage de volta pra row de auditoria pra aprovar
// ou rejeitar in-chat.
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('ai_tool_calls', (table) => {
      table.string('toolCallId', 191).nullable()
      table.index(['toolCallId'])
    })
  }

  async down() {
    this.schema.alterTable('ai_tool_calls', (table) => {
      table.dropIndex(['toolCallId'])
      table.dropColumn('toolCallId')
    })
  }
}
