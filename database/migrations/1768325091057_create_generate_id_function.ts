import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Create generate_id function for generating short unique IDs
    await this.db.rawQuery(`
      CREATE OR REPLACE FUNCTION generate_id(length integer DEFAULT 7)
      RETURNS varchar AS $$
      DECLARE
        chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
        result varchar := '';
        i integer := 0;
      BEGIN
        FOR i IN 1..length LOOP
          result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `)
  }

  async down() {
    await this.db.rawQuery('DROP FUNCTION IF EXISTS generate_id(integer);')
  }
}
