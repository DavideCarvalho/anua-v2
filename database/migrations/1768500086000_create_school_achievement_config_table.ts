import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolAchievementConfig'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('achievementId')
        .notNullable()
        .references('id')
        .inTable('Achievement')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['schoolId', 'achievementId'])
      table.index(['achievementId'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
