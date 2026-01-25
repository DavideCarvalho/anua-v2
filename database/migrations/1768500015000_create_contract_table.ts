import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Contract'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('academicPeriodId').nullable()
      table.text('name').notNullable()
      table.text('description').nullable()
      table.date('endDate').nullable()
      table.integer('enrollmentValue').nullable()
      table.integer('ammount').notNullable()
      table.text('docusealTemplateId').nullable()
      table.specificType('paymentType', '"ContractPaymentType"').notNullable()
      table.integer('enrollmentValueInstallments').notNullable().defaultTo(1)
      table.integer('enrollmentPaymentUntilDays').nullable()
      table.integer('installments').notNullable().defaultTo(1)
      table.boolean('flexibleInstallments').notNullable().defaultTo(false)
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.boolean('hasInsurance').notNullable().defaultTo(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
