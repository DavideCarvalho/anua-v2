import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected announcementTableName = 'SchoolAnnouncement'
  protected recipientsTableName = 'SchoolAnnouncementRecipient'

  async up() {
    this.schema.createTable(this.announcementTableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('title').notNullable()
      table.text('body').notNullable()
      table.string('status', 30).notNullable().defaultTo('DRAFT')
      table.timestamp('publishedAt').nullable()
      table
        .text('createdByUserId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())

      table.index(['schoolId'])
      table.index(['status'])
      table.index(['publishedAt'])
    })

    this.schema.createTable(this.recipientsTableName, (table) => {
      table.text('id').primary()
      table
        .text('announcementId')
        .notNullable()
        .references('id')
        .inTable(this.announcementTableName)
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('responsibleId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('studentId')
        .nullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('notificationId')
        .nullable()
        .references('id')
        .inTable('Notification')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['announcementId'])
      table.index(['responsibleId'])
      table.index(['notificationId'])
      table.unique(['announcementId', 'responsibleId', 'studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.recipientsTableName)
    this.schema.dropTable(this.announcementTableName)
  }
}
