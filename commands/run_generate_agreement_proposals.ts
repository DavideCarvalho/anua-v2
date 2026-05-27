import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'
import User from '#models/user'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import AgreementProposal from '#models/agreement_proposal'
import AgreementProposalInvoice from '#models/agreement_proposal_invoice'

export default class RunGenerateAgreementProposals extends BaseCommand {
  static commandName = 'proposals:generate'
  static description = 'Gera propostas de acordo inline (sem fila)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ description: 'Dias mínimos de atraso (default: 15)', alias: 'd' })
  declare days: number | undefined

  @flags.boolean({ description: 'Dry run', alias: 'n' })
  declare dryRun: boolean

  async run() {
    const minDays = this.days ?? 15
    const cutoffDate = DateTime.now().minus({ days: minDays }).toSQLDate()!

    this.logger.info(`Buscando faturas OVERDUE com mais de ${minDays} dias...`)

    const overdueInvoices = await Invoice.query()
      .where('status', 'OVERDUE')
      .where('dueDate', '<', cutoffDate)
      .whereDoesntHave('payments', (q) => {
        q.where('type', 'AGREEMENT')
      })
      .preload('student')

    this.logger.info(`Encontradas ${overdueInvoices.length} faturas elegíveis`)

    if (overdueInvoices.length === 0) return

    const byStudent = new Map<string, typeof overdueInvoices>()
    for (const invoice of overdueInvoices) {
      const existing = byStudent.get(invoice.studentId) ?? []
      existing.push(invoice)
      byStudent.set(invoice.studentId, existing)
    }

    this.logger.info(`${byStudent.size} alunos com faturas em atraso`)

    let created = 0
    let skipped = 0

    for (const [studentId, invoices] of byStudent) {
      if (invoices.length < 2) {
        skipped++
        continue
      }

      const activeProposal = await AgreementProposal.query()
        .where('studentId', studentId)
        .whereIn('status', ['PENDING_SCHOOL_APPROVAL', 'APPROVED', 'SENT_TO_RESPONSIBLE'])
        .first()

      if (activeProposal) {
        this.logger.info(`  Skip ${studentId}: já tem proposta ativa`)
        skipped++
        continue
      }

      const student = invoices[0].student
      const contractId = student.contractId ?? invoices[0].contractId
      let schoolId: string | null = null

      if (contractId) {
        const contract = await Contract.find(contractId)
        schoolId = contract?.schoolId ?? null
      }

      if (!schoolId) {
        const enrollment = await StudentHasLevel.query()
          .where('studentId', studentId)
          .preload('contract')
          .first()
        schoolId = enrollment?.contract?.schoolId ?? null
      }

      if (!schoolId) {
        this.logger.warning(`  Skip ${studentId}: sem escola via contrato`)
        skipped++
        continue
      }

      const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
      const maxOverdueDays = Math.max(
        ...invoices.map((inv) => Math.floor(DateTime.now().diff(inv.dueDate, 'days').days))
      )
      const installments = totalAmount > 50000 ? 3 : 2

      const user = await User.find(studentId)
      this.logger.info(
        `  ${user?.name ?? studentId}: ${invoices.length} faturas, R$${(totalAmount / 100).toFixed(2)}, ${maxOverdueDays}d atraso, ${installments}x`
      )

      if (this.dryRun) {
        created++
        continue
      }

      const trx = await db.transaction()
      try {
        const proposal = await AgreementProposal.create(
          {
            schoolId,
            studentId,
            status: 'PENDING_SCHOOL_APPROVAL',
            totalAmount,
            installments,
            overdueDays: maxOverdueDays,
            expiresAt: DateTime.now().plus({ days: 30 }),
          },
          { client: trx }
        )

        for (const invoice of invoices) {
          const days = Math.floor(DateTime.now().diff(invoice.dueDate, 'days').days)
          await AgreementProposalInvoice.create(
            {
              proposalId: proposal.id,
              invoiceId: invoice.id,
              amount: Number(invoice.totalAmount),
              overdueDays: days,
            },
            { client: trx }
          )
        }

        await trx.commit()
        created++
      } catch (error) {
        await trx.rollback()
        this.logger.error(`  Erro ao criar proposta para ${studentId}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    this.logger.info(`--- Resumo ---`)
    this.logger.info(`Criadas: ${created}`)
    this.logger.info(`Ignoradas: ${skipped}`)
    if (this.dryRun) this.logger.info('(dry-run)')
  }
}
