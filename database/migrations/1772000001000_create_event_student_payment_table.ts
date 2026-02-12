import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventStudentPayment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('eventId')
        .notNullable()
        .references('id')
        .inTable('Event')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('responsibleId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('eventParentalConsentId')
        .nullable()
        .references('id')
        .inTable('EventParentalConsent')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('studentPaymentId')
        .notNullable()
        .references('id')
        .inTable('StudentPayment')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('status').notNullable().defaultTo('PENDING')
      table.unique(['eventId', 'studentId'])
      table.unique(['studentPaymentId'])
      table.index(['eventId'])
      table.index(['studentId'])
      table.index(['eventParentalConsentId'])
      table.index(['responsibleId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
