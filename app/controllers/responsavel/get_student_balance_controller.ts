import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentHasResponsible from '#models/student_has_responsible'
import db from '@adonisjs/lucid/services/db'

export default class GetStudentBalanceController {
  async handle({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver o saldo deste aluno',
      })
    }

    // Get transactions
    const transactions = await StudentBalanceTransaction.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Calculate current balance
    const balanceResult = await db.rawQuery(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'CREDIT' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type = 'DEBIT' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_debits
      FROM student_balance_transactions
      WHERE student_id = :studentId
      `,
      { studentId }
    )

    const totalCredits = Number(balanceResult.rows[0]?.total_credits || 0)
    const totalDebits = Number(balanceResult.rows[0]?.total_debits || 0)
    const currentBalance = totalCredits - totalDebits

    return response.ok({
      data: transactions.all().map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      meta: transactions.getMeta(),
      summary: {
        currentBalance,
        totalCredits,
        totalDebits,
      },
    })
  }
}
