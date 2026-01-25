import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Subscription'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('planId')
        .nullable()
        .references('id')
        .inTable('SubscriptionPlan')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
        .unique()
      table
        .text('schoolChainId')
        .nullable()
        .references('id')
        .inTable('SchoolChain')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
        .unique()
      table.specificType('status', '"SubscriptionStatus"').notNullable().defaultTo('TRIAL')
      table.specificType('billingCycle', '"BillingCycle"').notNullable().defaultTo('MONTHLY')
      table.date('currentPeriodStart').notNullable()
      table.date('currentPeriodEnd').notNullable()
      table.date('trialEndsAt').nullable()
      table.timestamp('canceledAt').nullable()
      table.timestamp('pausedAt').nullable()
      table.timestamp('blockedAt').nullable()
      table.integer('pricePerStudent').notNullable()
      table.integer('activeStudents').notNullable().defaultTo(0)
      table.integer('monthlyAmount').notNullable().defaultTo(0)
      table.integer('discount').notNullable().defaultTo(0)
      table.text('paymentGatewayId').nullable()
      table.text('paymentMethod').nullable()
      table.text('creditCardToken').nullable()
      table.text('creditCardHolderName').nullable()
      table.text('creditCardLastFourDigits').nullable()
      table.text('creditCardBrand').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['currentPeriodEnd'])
      table.index(['planId'])
      table.index(['schoolChainId'])
      table.index(['schoolId'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
