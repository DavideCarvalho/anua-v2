import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolAnnouncementAttachment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('file').nullable()
    })

    this.defer(async (db) => {
      await db.rawQuery(
        'UPDATE "SchoolAnnouncementAttachment" SET "file" = "filePath" WHERE "file" IS NULL AND "filePath" IS NOT NULL'
      )
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('file')
    })
  }
}
