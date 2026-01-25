import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolChainAchievementConfig'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolChainId')
        .notNullable()
        .references('id')
        .inTable('SchoolChain')
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
      table.unique(['schoolChainId', 'achievementId'])
      table.index(['achievementId'])
      table.index(['schoolChainId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
