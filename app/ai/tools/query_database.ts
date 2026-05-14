import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

type ToolCtx = { schoolId: string; userId: string }

const ALLOWED_TABLES = [
  'Student',
  'User',
  'Class',
  'Course',
  'Level',
  'Subject',
  'Teacher',
  'Attendance',
  'Assignment',
  'StudentPayment',
  'Invoice',
  'Contract',
  'StudentGamification',
  'Achievement',
  'PointTransaction',
  'Leaderboard',
  'CanteenPurchase',
  'CanteenMeal',
  'CanteenMealReservation',
  'Event',
  'Notification',
  'Occurence',
  'SchoolAnnouncement',
]

const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'CREATE',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'COPY',
  '--',
  '/*',
  '$$',
]

export function createGetSchema(_ctx: ToolCtx) {
  return defineTool({
    name: 'getSchema',
    description:
      'Retorna a estrutura das tabelas do banco de dados da escola (nome da tabela, colunas, tipos). Use antes de queryDatabase para saber quais colunas existem.',
    parameters: z.object({}),
    execute: async () => {
      const tables = await db.rawQuery(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (${ALLOWED_TABLES.map((t) => `'${t}'`).join(',')})
        ORDER BY table_name, ordinal_position
      `)

      const schema: Record<string, Array<{ column: string; type: string; nullable: boolean }>> = {}
      for (const row of tables.rows ?? []) {
        if (!schema[row.table_name]) schema[row.table_name] = []
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
        })
      }
      return { tables: schema }
    },
  })
}

export function createQueryDatabase(ctx: ToolCtx) {
  return defineTool({
    name: 'queryDatabase',
    description:
      'Executa uma consulta SQL SELECT no banco da escola. Máximo 100 resultados. Use getSchema primeiro para descobrir as colunas.',
    parameters: z.object({
      sql: z
        .string()
        .describe(
          'Consulta SQL SELECT para executar. Use "schoolId" como placeholder para o ID da escola atual. Ex: SELECT * FROM "Student" WHERE "schoolId" = schoolId'
        ),
      limit: z.number().default(20).describe('Máximo de resultados (max 100)'),
    }),
    execute: async ({ sql, limit }) => {
      const upper = sql.toUpperCase().trim()
      if (!upper.startsWith('SELECT')) {
        return { error: 'Apenas consultas SELECT são permitidas' }
      }

      for (const kw of FORBIDDEN_KEYWORDS) {
        if (upper.includes(kw) && !kw.startsWith('SELECT')) {
          return { error: `Palavra clave ${kw} não é permitida` }
        }
      }

      const safeSql = sql.replace(/\bschoolId\b/g, `'${ctx.schoolId}'`)
      const limitedSql = safeSql.replace(/;\s*$/, '') + ` LIMIT ${Math.min(limit ?? 20, 100)}`

      const result = await db.rawQuery(limitedSql)
      return {
        rows: result.rows ?? [],
        rowCount: (result.rows ?? []).length,
      }
    },
  })
}

toolRegistry.register('comunicador', createGetSchema)
toolRegistry.register('comunicador', createQueryDatabase)
