import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolAnnouncementAudience'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('announcementId')
        .notNullable()
        .references('id')
        .inTable('SchoolAnnouncement')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('scopeType').notNullable()
      table.text('scopeId').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.unique(['announcementId', 'scopeType', 'scopeId'])
      table.index(['announcementId'])
      table.index(['scopeType'])
      table.index(['scopeId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
