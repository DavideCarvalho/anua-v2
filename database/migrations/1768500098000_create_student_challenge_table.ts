import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentChallenge'

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
        .text('challengeId')
        .notNullable()
        .references('id')
        .inTable('Challenge')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('progress').notNullable().defaultTo(0)
      table.boolean('isCompleted').notNullable().defaultTo(false)
      table.timestamp('completedAt').nullable()
      table.timestamp('startedAt').notNullable().defaultTo(this.now())
      table.unique(['studentGamificationId', 'challengeId'])
      table.index(['challengeId'])
      table.index(['studentGamificationId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
