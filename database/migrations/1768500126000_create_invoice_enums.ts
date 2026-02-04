import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "InvoiceType" AS ENUM ('MONTHLY', 'UPFRONT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "InvoiceStatus" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "InvoiceType" CASCADE')
  }
}
