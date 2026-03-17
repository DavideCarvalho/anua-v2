import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(
      `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_OVERDUE'`
    )
  }

  async down() {
    // PostgreSQL does not support removing enum values safely.
  }
}
