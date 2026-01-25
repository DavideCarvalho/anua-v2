import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'School'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())
      table.text('name').notNullable()
      table.text('slug').notNullable().unique()
      table.text('street').nullable()
      table.text('number').nullable()
      table.text('complement').nullable()
      table.text('neighborhood').nullable()
      table.text('city').nullable()
      table.text('state').nullable()
      table.text('zipCode').nullable()
      table.float('latitude', 8).nullable()
      table.float('longitude', 8).nullable()
      table.specificType('location', 'geography(Point,4326)').nullable()
      table.text('logoUrl').nullable()
      table.text('asaasAccountId').nullable()
      table.text('asaasWebhookToken').nullable()
      table.text('asaasWalletId').nullable()
      table.text('asaasApiKey').nullable()
      table.text('asaasDocumentUrl').nullable()
      table.boolean('asaasCommercialInfoIsExpired').nullable()
      table.timestamp('asaasCommercialInfoScheduledDate').nullable()
      table
        .specificType('paymentConfigStatus', '"PaymentConfigStatus"')
        .notNullable()
        .defaultTo('NOT_CONFIGURED')
      table.timestamp('paymentConfigStatusUpdatedAt').nullable()
      table.text('pixKey').nullable()
      table.specificType('pixKeyType', '"PixKeyType"').nullable()
      table.boolean('usePlatformManagedPayments').notNullable().defaultTo(false)
      table.boolean('enablePaymentNotifications').notNullable().defaultTo(true)
      table
        .text('schoolChainId')
        .nullable()
        .references('id')
        .inTable('SchoolChain')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.float('minimumGrade', 8).notNullable().defaultTo(6)
      table.text('calculationAlgorithm').notNullable().defaultTo('AVERAGE')
      table.float('minimumAttendancePercentage', 8).notNullable().defaultTo(75)
      table.boolean('hasInsurance').nullable()
      table.float('insurancePercentage', 8).nullable()
      table.float('insuranceCoveragePercentage', 8).nullable()
      table.integer('insuranceClaimWaitingDays').nullable()
      table.index(['id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
