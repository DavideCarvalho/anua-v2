import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Agreement'

  async up() {
    this.schema.raw(`
      ALTER TABLE "Agreement"
      ALTER COLUMN "finePercentage" TYPE NUMERIC(5, 2)
      USING "finePercentage"::numeric,
      ALTER COLUMN "dailyInterestPercentage" TYPE NUMERIC(5, 2)
      USING "dailyInterestPercentage"::numeric;
    `)
  }

  async down() {
    this.schema.raw(`
      ALTER TABLE "Agreement"
      ALTER COLUMN "finePercentage" TYPE INTEGER
      USING ROUND("finePercentage")::integer,
      ALTER COLUMN "dailyInterestPercentage" TYPE INTEGER
      USING ROUND("dailyInterestPercentage")::integer;
    `)
  }
}
