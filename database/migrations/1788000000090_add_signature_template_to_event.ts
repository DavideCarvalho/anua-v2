import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Event ganha template de assinatura opcional (mesma forma do Contract).
    const eventCols = await this.db.rawQuery(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'Event'
       AND column_name IN ('signatureTemplateSchemas', 'signatureTemplatePdfKey')`
    )
    const eventColNames: string[] = eventCols.rows.map(
      (r: { column_name: string }) => r.column_name
    )

    this.schema.alterTable('Event', (table) => {
      if (!eventColNames.includes('signatureTemplateSchemas')) {
        table.jsonb('signatureTemplateSchemas').nullable()
      }
      if (!eventColNames.includes('signatureTemplatePdfKey')) {
        table.text('signatureTemplatePdfKey').nullable()
      }
    })

    // EventParentalConsent ganha rastreamento da assinatura no provider.
    const consentCols = await this.db.rawQuery(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'EventParentalConsent'
       AND column_name IN ('signatureSubmissionId', 'signedDocumentUrl')`
    )
    const consentColNames: string[] = consentCols.rows.map(
      (r: { column_name: string }) => r.column_name
    )

    this.schema.alterTable('EventParentalConsent', (table) => {
      if (!consentColNames.includes('signatureSubmissionId')) {
        table.text('signatureSubmissionId').nullable()
      }
      if (!consentColNames.includes('signedDocumentUrl')) {
        table.text('signedDocumentUrl').nullable()
      }
    })
  }

  async down() {
    this.schema.alterTable('Event', (table) => {
      table.dropColumn('signatureTemplateSchemas')
      table.dropColumn('signatureTemplatePdfKey')
    })
    this.schema.alterTable('EventParentalConsent', (table) => {
      table.dropColumn('signatureSubmissionId')
      table.dropColumn('signedDocumentUrl')
    })
  }
}
