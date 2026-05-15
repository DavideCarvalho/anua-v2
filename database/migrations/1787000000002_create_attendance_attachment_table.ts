import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AttendanceAttachment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentHasAttendanceId')
        .notNullable()
        .references('id')
        .inTable('StudentHasAttendance')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('fileName').notNullable()
      table.text('file').nullable()
      table.text('mimeType').notNullable()
      table.integer('fileSizeBytes').notNullable()
      table
        .text('uploadedById')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['studentHasAttendanceId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
