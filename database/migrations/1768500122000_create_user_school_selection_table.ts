import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'UserSchoolSelection'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 255).primary()
      table.string('userId', 255).notNullable().references('id').inTable('User').onDelete('CASCADE')
      table
        .string('schoolId', 255)
        .notNullable()
        .references('id')
        .inTable('School')
        .onDelete('CASCADE')
      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()
      table.unique(['userId', 'schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
