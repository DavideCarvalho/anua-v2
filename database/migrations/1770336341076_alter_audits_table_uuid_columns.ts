import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audits'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Change auditable_id from integer to text for UUID support
      table.text('auditable_id_new').nullable()
      table.text('user_id_new').nullable()
    })

    // Copy data (if any)
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE audits
        SET auditable_id_new = auditable_id::text,
            user_id_new = user_id::text
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('auditable_id')
      table.dropColumn('user_id')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('auditable_id_new', 'auditable_id')
      table.renameColumn('user_id_new', 'user_id')
    })

    // Make auditable_id not nullable
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE audits
        ALTER COLUMN auditable_id SET NOT NULL
      `)
    })
  }

  async down() {
    // This is a one-way migration - can't convert text UUIDs back to integers
  }
}
