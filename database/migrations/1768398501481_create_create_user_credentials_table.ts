import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_credentials'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('credential_id').notNullable().unique() // WebAuthn credential ID (base64url)
      table.binary('public_key').notNullable() // Public key stored as binary
      table.bigInteger('counter').defaultTo(0) // Signature counter for replay attack prevention
      table.string('device_name').nullable() // User-friendly name: "iPhone 15", "YubiKey", etc
      table.json('transports').nullable() // ["usb", "nfc", "ble", "internal", "hybrid"]
      table.timestamp('created_at')
      table.timestamp('last_used_at')

      table.index(['user_id'])
      table.index(['credential_id'])
      table.index(['last_used_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
