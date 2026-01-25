import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentAchievement'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentGamificationId')
        .notNullable()
        .references('id')
        .inTable('StudentGamification')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('achievementId')
        .notNullable()
        .references('id')
        .inTable('Achievement')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('unlockedAt').notNullable().defaultTo(this.now())
      table.integer('progress').notNullable().defaultTo(100)
      table.unique(['studentGamificationId', 'achievementId'])
      table.index(['studentGamificationId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
