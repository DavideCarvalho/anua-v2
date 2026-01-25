import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventParentalConsent'

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
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('status', '"ParentalConsentStatus"').notNullable().defaultTo('PENDING')
      table.timestamp('respondedAt').nullable()
      table.timestamp('expiresAt').nullable()
      table.text('approvalNotes').nullable()
      table.text('denialReason').nullable()
      table.text('signature').nullable()
      table.string('ipAddress', 45).nullable()
      table.timestamp('emailSentAt').nullable()
      table.timestamp('reminderSentAt').nullable()
      table.integer('reminderCount').notNullable().defaultTo(0)
      table.jsonb('metadata').nullable()
      table.unique(['eventId', 'studentId', 'responsibleId'])
      table.index(['eventId'])
      table.index(['expiresAt'])
      table.index(['responsibleId'])
      table.index(['status'])
      table.index(['studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
