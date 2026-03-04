import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentAvatar'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('skinTone').notNullable().defaultTo('medium')
      table.text('hairStyle').notNullable().defaultTo('default')
      table.text('hairColor').notNullable().defaultTo('brown')
      table.text('outfit').notNullable().defaultTo('default')
      table.jsonb('accessories').notNullable().defaultTo('[]')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
