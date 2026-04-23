import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolAnnouncementAttachment'

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
      table.text('fileName').notNullable()
      table.text('filePath').notNullable()
      table.text('mimeType').notNullable()
      table.integer('fileSizeBytes').notNullable()
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())

      table.index(['announcementId'])
      table.index(['position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
