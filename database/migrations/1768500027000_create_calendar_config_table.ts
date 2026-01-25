import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CalendarConfig'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.jsonb('classesConfig').nullable()
      table.jsonb('classesClashConfig').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
