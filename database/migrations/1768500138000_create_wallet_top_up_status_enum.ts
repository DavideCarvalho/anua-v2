import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "WalletTopUpStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "WalletTopUpStatus" CASCADE')
  }
}
