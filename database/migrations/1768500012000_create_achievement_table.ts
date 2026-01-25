import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Achievement'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('slug').notNullable()
      table.text('name').notNullable()
      table.text('description').notNullable()
      table.text('icon').nullable()
      table.integer('points').notNullable().defaultTo(0)
      table.specificType('category', '"AchievementCategory"').notNullable()
      table.jsonb('criteria').notNullable()
      table.boolean('isSecret').notNullable().defaultTo(false)
      table.specificType('rarity', '"AchievementRarity"').notNullable().defaultTo('COMMON')
      table.integer('maxUnlocks').nullable()
      table.specificType('recurrencePeriod', '"RecurrencePeriod"').nullable()
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('schoolChainId')
        .nullable()
        .references('id')
        .inTable('SchoolChain')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('deletedAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['slug', 'schoolId'])
      table.index(['deletedAt'])
      table.index(['schoolChainId'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
