import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Event'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.string('shortDescription', 500).nullable()
      table.specificType('type', '"EventType"').notNullable()
      table.specificType('status', '"EventStatus"').notNullable().defaultTo('DRAFT')
      table.specificType('visibility', '"EventVisibility"').notNullable().defaultTo('PUBLIC')
      table.specificType('priority', '"EventPriority"').notNullable().defaultTo('NORMAL')
      table.timestamp('startDate').notNullable()
      table.timestamp('endDate').nullable()
      table.time('startTime').nullable()
      table.time('endTime').nullable()
      table.boolean('isAllDay').notNullable().defaultTo(false)
      table.string('location', 255).nullable()
      table.text('locationDetails').nullable()
      table.boolean('isOnline').notNullable().defaultTo(false)
      table.string('onlineUrl', 512).nullable()
      table.boolean('isExternal').notNullable().defaultTo(false)
      table
        .text('organizerId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.integer('maxParticipants').nullable()
      table.integer('currentParticipants').notNullable().defaultTo(0)
      table.boolean('requiresRegistration').notNullable().defaultTo(false)
      table.timestamp('registrationDeadline').nullable()
      table.boolean('requiresParentalConsent').notNullable().defaultTo(false)
      table.boolean('allowComments').notNullable().defaultTo(true)
      table.boolean('sendNotifications').notNullable().defaultTo(true)
      table.boolean('isRecurring').notNullable().defaultTo(false)
      table.jsonb('recurringPattern').nullable()
      table.string('bannerUrl', 512).nullable()
      table.jsonb('attachments').nullable()
      table.specificType('tags', 'text[]').nullable()
      table.jsonb('metadata').nullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('createdBy')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.index(['createdBy'])
      table.index(['schoolId', 'startDate'])
      table.index(['startDate', 'endDate'])
      table.index(['type', 'status'])
      table.index(['visibility'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
