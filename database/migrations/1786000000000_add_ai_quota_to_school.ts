import { BaseSchema } from '@adonisjs/lucid/schema'

// Quota mensal de tokens de IA por escola. NULL = sem limite (default — não
// queremos travar ninguém antes da gente entender o uso real). Quando uma
// escola "estourar a quota", o assistente devolve mensagem polida e o
// /admin/ai/tokens mostra a escola em alerta.
export default class extends BaseSchema {
  protected tableName = 'School'

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'maxMonthlyChatTokens')
    if (!hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.bigInteger('maxMonthlyChatTokens').nullable()
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('maxMonthlyChatTokens')
    })
  }
}
