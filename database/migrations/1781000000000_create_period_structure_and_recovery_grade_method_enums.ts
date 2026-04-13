import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "PeriodStructure" AS ENUM ('BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "RecoveryGradeMethod" AS ENUM ('AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP TYPE IF EXISTS "RecoveryGradeMethod" CASCADE')
    await this.db.rawQuery('DROP TYPE IF EXISTS "PeriodStructure" CASCADE')
  }
}
