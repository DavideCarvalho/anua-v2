import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Add ANUAL to the PeriodStructure ENUM type used by School
    await this.db.rawQuery(`
      ALTER TYPE "PeriodStructure" ADD VALUE IF NOT EXISTS 'ANUAL';
    `)

    // 2. Update the check constraint on AcademicPeriod
    await this.db.rawQuery(`
      ALTER TABLE "AcademicPeriod" 
      DROP CONSTRAINT IF EXISTS "AcademicPeriod_periodStructure_check";
    `)

    await this.db.rawQuery(`
      ALTER TABLE "AcademicPeriod" 
      ADD CONSTRAINT "AcademicPeriod_periodStructure_check" 
      CHECK ("periodStructure" IN ('BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'));
    `)
  }

  async down() {
    // We cannot easily remove enum values in postgres, so we skip down for the type
    // We revert the check constraint on AcademicPeriod
    await this.db.rawQuery(`
      ALTER TABLE "AcademicPeriod" 
      DROP CONSTRAINT IF EXISTS "AcademicPeriod_periodStructure_check";
    `)

    await this.db.rawQuery(`
      ALTER TABLE "AcademicPeriod" 
      ADD CONSTRAINT "AcademicPeriod_periodStructure_check" 
      CHECK ("periodStructure" IN ('BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL'));
    `)
  }
}
