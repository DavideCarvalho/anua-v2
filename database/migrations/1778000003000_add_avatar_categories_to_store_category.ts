import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      ALTER TYPE "StoreCategory" ADD VALUE IF NOT EXISTS 'AVATAR_HAIR'
    `)
    await this.db.rawQuery(`
      ALTER TYPE "StoreCategory" ADD VALUE IF NOT EXISTS 'AVATAR_OUTFIT'
    `)
    await this.db.rawQuery(`
      ALTER TYPE "StoreCategory" ADD VALUE IF NOT EXISTS 'AVATAR_ACCESSORY'
    `)
  }

  async down() {
    // PostgreSQL does not support removing enum values easily.
    // Would require recreating the enum and all dependent columns.
    // Leaving empty for safety - rollback not typically used for enum additions.
  }
}
