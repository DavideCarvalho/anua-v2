import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`ALTER TYPE "PaymentType" ADD VALUE IF NOT EXISTS 'EXTRA_CLASS'`)
  }

  async down() {
    // Cannot remove enum values in PostgreSQL without recreating the type
  }
}
