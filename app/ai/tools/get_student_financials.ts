import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfStudentOutOfScope } from '../scope_check.js'

type PaymentRow = {
  id: string
  type: string
  status: string
  totalAmount: number
  dueDate: string | null
  paidAt: string | null
  month: number | null
  year: number | null
}

type FinancialSummary = {
  totalAmountCents: number
  overdueAmountCents: number
  pendingAmountCents: number
  paidAmountCents: number
}

const DESCRIPTION = `Situação financeira de um aluno — boletos, mensalidades, status de pagamento.

Parâmetros:
- studentId (UUID): id do aluno.
- onlyOpen (boolean, opcional): se true, traz só boletos abertos/pendentes/vencidos (exclui PAGOS).

Retorna { summary: { totalAmountCents, overdueAmountCents, pendingAmountCents, paidAmountCents }, payments: [...] }.

TODOS os valores em CENTAVOS — use formatRows com moneyColumns: ['totalAmount'] antes de renderResult.
Status: OPEN/PENDING/PAID/OVERDUE/CANCELLED/RENEGOTIATED — traduza via formatRows com enumColumns: { status: 'invoiceStatus' }.

Para responsável: a tool já filtra automaticamente os filhos com isFinancial=true. Se o responsável só for pedagógico (não financeiro), retorna acesso negado.

Se você não tem acesso ao aluno, retorna { error: '...' }.`

export function createGetStudentFinancials(ctx: ToolContext) {
  return defineTool({
    name: 'getStudentFinancials',
    description: DESCRIPTION,
    parameters: z.object({
      studentId: z.string().uuid().describe('UUID do aluno'),
      onlyOpen: z.boolean().optional().describe('Excluir pagamentos já quitados'),
    }),
    execute: async ({ studentId, onlyOpen }) => {
      const denial = denyIfStudentOutOfScope(ctx.scope, studentId)
      if (denial) return { error: denial }

      // Camada extra de proteção pro papel "responsavel": só pode ver
      // financeiro de filho com isFinancial=true. O scope geral autoriza ver
      // o aluno (escolar/pedagógico), mas financeiro exige a flag específica.
      if (ctx.scope.role === 'responsavel') {
        const { rows: flagRows } = await db.rawQuery<{
          rows: Array<{ isFinancial: boolean }>
        }>(
          `
            SELECT "isFinancial"
            FROM "StudentHasResponsible"
            WHERE "studentId" = :studentId
              AND "responsibleId" = :userId
          `,
          { studentId, userId: ctx.userId }
        )
        const hasFinancialAccess = flagRows.some((r) => r.isFinancial === true)
        if (!hasFinancialAccess) {
          return {
            error:
              'Você está cadastrado apenas como responsável pedagógico desse aluno — o responsável financeiro tem que consultar essa informação.',
          }
        }
      }

      const { rows: payments } = await db.rawQuery<{ rows: PaymentRow[] }>(
        `
          SELECT id, type, status,
            "totalAmount" AS "totalAmount",
            "dueDate"::text AS "dueDate",
            "paidAt"::text AS "paidAt",
            month, year
          FROM "StudentPayment"
          WHERE "studentId" = :studentId
            ${onlyOpen ? `AND status NOT IN ('PAID', 'CANCELLED')` : ''}
          ORDER BY "dueDate" DESC NULLS LAST
          LIMIT 100
        `,
        { studentId }
      )

      const summary: FinancialSummary = {
        totalAmountCents: 0,
        overdueAmountCents: 0,
        pendingAmountCents: 0,
        paidAmountCents: 0,
      }
      for (const p of payments) {
        const amount = Number(p.totalAmount) || 0
        summary.totalAmountCents += amount
        if (p.status === 'OVERDUE') summary.overdueAmountCents += amount
        else if (p.status === 'PENDING' || p.status === 'OPEN') summary.pendingAmountCents += amount
        else if (p.status === 'PAID') summary.paidAmountCents += amount
      }

      return { summary, payments }
    },
  })
}

toolRegistry.register('gestor', createGetStudentFinancials)
toolRegistry.register('responsavel', createGetStudentFinancials)
