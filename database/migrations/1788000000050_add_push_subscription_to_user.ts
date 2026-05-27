import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    const hasColumn = await this.db.rawQuery(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'push_subscription'`
    )
    if (hasColumn.rows.length > 0) return

    this.schema.alterTable(this.tableName, (table) => {
      table.text('push_subscription').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('push_subscription')
    })
  }
}
