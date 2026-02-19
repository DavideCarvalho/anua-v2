import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('SchoolChain', (table) => {
      table.boolean('nfseEnabled').defaultTo(false).notNullable()
      table.string('nfseMunicipalServiceCode').nullable()
      table.string('nfseMunicipalServiceName').nullable()
      table.decimal('nfseIssPercentage', 5, 2).nullable()
      table.decimal('nfseCofinsPercentage', 5, 2).nullable()
      table.decimal('nfsePisPercentage', 5, 2).nullable()
      table.decimal('nfseCsllPercentage', 5, 2).nullable()
      table.decimal('nfseInssPercentage', 5, 2).nullable()
      table.decimal('nfseIrPercentage', 5, 2).nullable()
      table.integer('nfseDeductions').nullable()
    })

    this.schema.alterTable('School', (table) => {
      table.boolean('nfseEnabled').defaultTo(false).notNullable()
      table.string('nfseMunicipalServiceCode').nullable()
      table.string('nfseMunicipalServiceName').nullable()
      table.decimal('nfseIssPercentage', 5, 2).nullable()
      table.decimal('nfseCofinsPercentage', 5, 2).nullable()
      table.decimal('nfsePisPercentage', 5, 2).nullable()
      table.decimal('nfseCsllPercentage', 5, 2).nullable()
      table.decimal('nfseInssPercentage', 5, 2).nullable()
      table.decimal('nfseIrPercentage', 5, 2).nullable()
      table.integer('nfseDeductions').nullable()
    })
  }

  async down() {
    this.schema.alterTable('SchoolChain', (table) => {
      table.dropColumn('nfseEnabled')
      table.dropColumn('nfseMunicipalServiceCode')
      table.dropColumn('nfseMunicipalServiceName')
      table.dropColumn('nfseIssPercentage')
      table.dropColumn('nfseCofinsPercentage')
      table.dropColumn('nfsePisPercentage')
      table.dropColumn('nfseCsllPercentage')
      table.dropColumn('nfseInssPercentage')
      table.dropColumn('nfseIrPercentage')
      table.dropColumn('nfseDeductions')
    })

    this.schema.alterTable('School', (table) => {
      table.dropColumn('nfseEnabled')
      table.dropColumn('nfseMunicipalServiceCode')
      table.dropColumn('nfseMunicipalServiceName')
      table.dropColumn('nfseIssPercentage')
      table.dropColumn('nfseCofinsPercentage')
      table.dropColumn('nfsePisPercentage')
      table.dropColumn('nfseCsllPercentage')
      table.dropColumn('nfseInssPercentage')
      table.dropColumn('nfseIrPercentage')
      table.dropColumn('nfseDeductions')
    })
  }
}
