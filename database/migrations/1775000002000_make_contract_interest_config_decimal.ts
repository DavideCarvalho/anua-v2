import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ContractInterestConfig'

  async up() {
    this.schema.raw(`
      ALTER TABLE "ContractInterestConfig"
      ALTER COLUMN "delayInterestPercentage" TYPE NUMERIC(6, 3)
      USING "delayInterestPercentage"::numeric,
      ALTER COLUMN "delayInterestPerDayDelayed" TYPE NUMERIC(6, 3)
      USING "delayInterestPerDayDelayed"::numeric;
    `)
  }

  async down() {
    this.schema.raw(`
      ALTER TABLE "ContractInterestConfig"
      ALTER COLUMN "delayInterestPercentage" TYPE INTEGER
      USING ROUND("delayInterestPercentage")::integer,
      ALTER COLUMN "delayInterestPerDayDelayed" TYPE INTEGER
      USING ROUND("delayInterestPerDayDelayed")::integer;
    `)
  }
}
