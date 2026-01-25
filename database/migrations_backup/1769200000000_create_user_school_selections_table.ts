import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'UserSchoolSelection'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('userId').notNullable().references('id').inTable('User').onDelete('CASCADE')
      table.string('schoolId').notNullable().references('id').inTable('School').onDelete('CASCADE')
      table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(this.now())

      // Unique constraint: a user can only select a school once
      table.unique(['userId', 'schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
