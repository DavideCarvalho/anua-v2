import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Contract'

  async up() {
    const existing = await this.db.rawQuery(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'Contract'
       AND column_name IN ('signatureTemplateSchemas', 'signatureTemplatePdfKey')`
    )
    const existingNames: string[] = existing.rows.map((r: { column_name: string }) => r.column_name)

    this.schema.alterTable(this.tableName, (table) => {
      if (!existingNames.includes('signatureTemplateSchemas')) {
        table.jsonb('signatureTemplateSchemas').nullable()
      }
      if (!existingNames.includes('signatureTemplatePdfKey')) {
        table.text('signatureTemplatePdfKey').nullable()
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('signatureTemplateSchemas')
      table.dropColumn('signatureTemplatePdfKey')
    })
  }
}
