import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'RENEGOTIATED'`)
    await this.db.rawQuery(`ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'RENEGOTIATED'`)
  }

  async down() {
    // Cannot remove enum values in PostgreSQL without recreating the type
  }
}
