import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerStudentPaymentApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.studentPayments.ListStudentPayments])
        .as('student_payments.index')
      router
        .post('/', [controllers.studentPayments.CreateStudentPayment])
        .as('student_payments.store')
      router
        .get('/:id', [controllers.studentPayments.ShowStudentPayment])
        .as('student_payments.show')
      router
        .put('/:id', [controllers.studentPayments.UpdateStudentPayment])
        .as('student_payments.update')
      router
        .post('/:id/cancel', [controllers.studentPayments.CancelStudentPayment])
        .as('student_payments.cancel')
      router
        .post('/:id/mark-paid', [controllers.studentPayments.MarkPaymentAsPaid])
        .as('student_payments.mark_paid')
      router
        .post('/:id/asaas-charge', [controllers.studentPayments.CreateStudentPaymentAsaasCharge])
        .as('student_payments.asaas_charge')
      router
        .post('/:id/send-boleto', [controllers.studentPayments.SendStudentPaymentBoletoEmail])
        .as('student_payments.send_boleto')
      router
        .get('/:id/boleto', [controllers.studentPayments.GetStudentPaymentBoleto])
        .as('student_payments.get_boleto')
    })
    .prefix('/student-payments')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAgreementApiRoutes() {
  router
    .group(() => {
      router.post('/', [controllers.agreements.CreateAgreement]).as('agreements.store')
    })
    .prefix('/agreements')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAgreementProposalApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.agreementProposals.ListSchoolAgreementProposals])
        .as('agreement_proposals.index')
      router
        .post('/', [controllers.agreementProposals.CreateAgreementProposal])
        .as('agreement_proposals.store')
      router
        .post('/:id/approve', [controllers.agreementProposals.ApproveSchoolAgreementProposal])
        .as('agreement_proposals.approve')
      router
        .post('/:id/reject', [controllers.agreementProposals.RejectSchoolAgreementProposal])
        .as('agreement_proposals.reject')
    })
    .prefix('/agreement-proposals')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerInvoiceApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.invoices.ListInvoices]).as('invoices.index')
      router.post('/:id/mark-paid', [controllers.invoices.MarkInvoicePaid]).as('invoices.mark_paid')
    })
    .prefix('/invoices')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAuditApiRoutes() {
  router
    .group(() => {
      router.get('/:entityType/:entityId', [controllers.audits.ListAudits]).as('audits.index')
      router
        .get('/students/:studentId/history', [controllers.audits.ListStudentAuditHistory])
        .as('audits.student_history')
    })
    .prefix('/audits')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerStudentBalanceTransactionApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.studentBalanceTransactions.ListStudentBalanceTransactions])
        .as('student_balance_transactions.index')
      router
        .post('/', [controllers.studentBalanceTransactions.CreateStudentBalanceTransaction])
        .as('student_balance_transactions.store')
      router
        .get('/:id', [controllers.studentBalanceTransactions.ShowStudentBalanceTransaction])
        .as('student_balance_transactions.show')
      router
        .get('/:studentId/balance-transactions', [
          controllers.studentBalanceTransactions.ListStudentBalanceByStudent,
        ])
        .as('student_balance_transactions.by_student')
      router
        .get('/:studentId/balance', [controllers.studentBalanceTransactions.GetStudentBalance])
        .as('student_balance_transactions.balance')
    })
    .prefix('/student-balance-transactions')
    .use([middleware.auth(), middleware.impersonation()])
}
