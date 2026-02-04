import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StoreType" AS ENUM ('INTERNAL', 'THIRD_PARTY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StoreOrderPaymentMode" AS ENUM ('IMMEDIATE', 'DEFERRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StoreOrderPaymentMethod" AS ENUM ('BALANCE', 'PIX', 'CASH', 'CARD');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "StoreSettlementStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'TRANSFERRED', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`ALTER TYPE "PaymentType" ADD VALUE IF NOT EXISTS 'STORE'`)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "StoreType" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StoreOrderPaymentMode" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StoreOrderPaymentMethod" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "StoreSettlementStatus" CASCADE')
  }
}
