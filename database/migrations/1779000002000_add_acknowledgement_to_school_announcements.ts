import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected announcementsTable = 'SchoolAnnouncement'
  protected recipientsTable = 'SchoolAnnouncementRecipient'

  async up() {
    this.schema.alterTable(this.announcementsTable, (table) => {
      table.boolean('requiresAcknowledgement').notNullable().defaultTo(false)
      table.timestamp('acknowledgementDueAt').nullable()
    })

    this.schema.alterTable(this.recipientsTable, (table) => {
      table.timestamp('acknowledgedAt').nullable()
      table.index(['acknowledgedAt'])
    })
  }

  async down() {
    this.schema.alterTable(this.recipientsTable, (table) => {
      table.dropIndex(['acknowledgedAt'])
      table.dropColumn('acknowledgedAt')
    })

    this.schema.alterTable(this.announcementsTable, (table) => {
      table.dropColumn('acknowledgementDueAt')
      table.dropColumn('requiresAcknowledgement')
    })
  }
}
