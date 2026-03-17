import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentHasResponsible from '#models/student_has_responsible'
import db from '@adonisjs/lucid/services/db'
import AppException from '#exceptions/app_exception'
import vine from '@vinejs/vine'

const getStudentBalanceValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

interface BalanceRow {
  total_credits: string | number
  total_debits: string | number
}

export default class GetStudentBalanceController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const payload = await request.validateUsing(getStudentBalanceValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver o saldo deste aluno')
    }

    // Get transactions
    const transactions = await StudentBalanceTransaction.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Calculate current balance
    // Types: TOP_UP, REFUND = credits; CANTEEN_PURCHASE, STORE_PURCHASE = debits; ADJUSTMENT = depends on amount sign
    const balanceResult = await db.rawQuery(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type IN ('TOP_UP', 'REFUND') AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN type = 'ADJUSTMENT' AND status = 'COMPLETED' AND amount > 0 THEN amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type IN ('CANTEEN_PURCHASE', 'STORE_PURCHASE') AND status = 'COMPLETED' THEN ABS(amount) ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN type = 'ADJUSTMENT' AND status = 'COMPLETED' AND amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_debits
      FROM "StudentBalanceTransaction"
      WHERE "studentId" = :studentId
      `,
      { studentId }
    )

    const balanceRow = balanceResult.rows[0] as BalanceRow | undefined
    const totalCredits = Number(balanceRow?.total_credits || 0)
    const totalDebits = Number(balanceRow?.total_debits || 0)
    const currentBalance = totalCredits - totalDebits

    const transactionsList = transactions.all().map((t) => {
      const amount = Number(t.amount)
      const normalizedType =
        t.type === 'TOP_UP' || t.type === 'REFUND' || (t.type === 'ADJUSTMENT' && amount > 0)
          ? 'CREDIT'
          : 'DEBIT'

      return {
        id: t.id,
        type: normalizedType,
        amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt.toJSDate(),
      }
    })

    const paginationMeta = transactions.getMeta()
    const meta = {
      total: paginationMeta.total,
      perPage: paginationMeta.perPage,
      currentPage: paginationMeta.currentPage,
      lastPage: paginationMeta.lastPage,
      firstPage: paginationMeta.firstPage,
    }

    const summary = {
      currentBalance,
      totalCredits,
      totalDebits,
    }

    return {
      data: transactionsList,
      meta,
      summary,
    }
  }
}
