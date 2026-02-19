import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nfseId').nullable()
      table
        .enum('nfseStatus', [
          'SCHEDULED',
          'AUTHORIZED',
          'PROCESSING_CANCELLATION',
          'CANCELLED',
          'CANCELLATION_DENIED',
          'ERROR',
        ])
        .nullable()
      table.string('nfseNumber').nullable()
      table.text('nfsePdfUrl').nullable()
      table.text('nfseXmlUrl').nullable()
      table.string('nfseRpsNumber').nullable()
      table.timestamp('nfseIssuedAt', { useTz: true }).nullable()
      table.text('nfseErrorMessage').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nfseId')
      table.dropColumn('nfseStatus')
      table.dropColumn('nfseNumber')
      table.dropColumn('nfsePdfUrl')
      table.dropColumn('nfseXmlUrl')
      table.dropColumn('nfseRpsNumber')
      table.dropColumn('nfseIssuedAt')
      table.dropColumn('nfseErrorMessage')
    })
  }
}
