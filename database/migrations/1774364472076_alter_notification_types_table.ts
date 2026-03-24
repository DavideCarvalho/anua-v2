import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(
      `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INQUIRY_CREATED'`
    )
    await this.db.rawQuery(
      `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INQUIRY_MESSAGE'`
    )
    await this.db.rawQuery(
      `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INQUIRY_RESOLVED'`
    )
  }

  async down() {
    // PostgreSQL doesn't support removing enum values
    // The down migration would require recreating the enum type
    // which is complex and risky, so we skip it
  }
}
