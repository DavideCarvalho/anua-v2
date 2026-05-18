import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'PARTIALLY_SIGNED', 'COMPLETED', 'CANCELLED', 'DECLINED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "SignatureStatus" CASCADE')
  }
}
