import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('ai_threads', (table) => {
      table.string('channel').notNullable().defaultTo('web')
    })
  }

  async down() {
    this.schema.alterTable('ai_threads', (table) => {
      table.dropColumn('channel')
    })
  }
}
