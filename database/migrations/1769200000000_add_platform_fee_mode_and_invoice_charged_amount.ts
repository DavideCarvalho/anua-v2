import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlatformFeeMode') THEN
            CREATE TYPE "PlatformFeeMode" AS ENUM ('PERCENTAGE', 'FIXED');
          END IF;
        END
        $$;
      `)

      await db.rawQuery(`
        ALTER TABLE "PaymentSettings"
        ADD COLUMN IF NOT EXISTS "platformFeeMode" "PlatformFeeMode" NOT NULL DEFAULT 'PERCENTAGE',
        ADD COLUMN IF NOT EXISTS "platformFeeFixedAmount" INTEGER NOT NULL DEFAULT 0;
      `)

      await db.rawQuery(`
        ALTER TABLE "Invoice"
        ADD COLUMN IF NOT EXISTS "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "chargedAmount" INTEGER NOT NULL DEFAULT 0;
      `)

      await db.rawQuery(`
        UPDATE "Invoice"
        SET "chargedAmount" = "totalAmount" + COALESCE("platformFeeAmount", 0)
        WHERE "chargedAmount" = 0;
      `)
    })
  }

  async down() {
    this.schema.alterTable('Invoice', (table) => {
      table.dropColumn('chargedAmount')
      table.dropColumn('platformFeeAmount')
    })

    this.schema.alterTable('PaymentSettings', (table) => {
      table.dropColumn('platformFeeFixedAmount')
      table.dropColumn('platformFeeMode')
    })

    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS "PlatformFeeMode"')
    })
  }
}
