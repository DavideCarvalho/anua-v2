import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'UserCredential'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('credentialId').notNullable().unique()
      table.binary('publicKey').notNullable()
      table.bigInteger('counter').notNullable().defaultTo(0)
      table.text('deviceName').nullable()
      table.specificType('transports', 'text[]').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('lastUsedAt').notNullable()
      table.index(['credentialId'])
      table.index(['userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
