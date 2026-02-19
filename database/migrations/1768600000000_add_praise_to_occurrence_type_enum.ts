import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery('ALTER TYPE "OccurenceType" ADD VALUE IF NOT EXISTS \'PRAISE\'')
  }

  async down() {
    // Postgres enum values cannot be safely removed in down migrations.
  }
}
