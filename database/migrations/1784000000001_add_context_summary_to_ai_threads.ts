import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('ai_threads', (table) => {
      table.text('contextSummary').nullable()
      table.uuid('summaryUpToMessageId').nullable()
    })
  }

  async down() {
    this.schema.alterTable('ai_threads', (table) => {
      table.dropColumn('contextSummary')
      table.dropColumn('summaryUpToMessageId')
    })
  }
}
