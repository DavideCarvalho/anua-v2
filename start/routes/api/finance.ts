import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Student Payments
const ListStudentPaymentsController = () =>
  import('#controllers/student_payments/list_student_payments_controller')
const ShowStudentPaymentController = () =>
  import('#controllers/student_payments/show_student_payment_controller')
const CreateStudentPaymentController = () =>
  import('#controllers/student_payments/create_student_payment_controller')
const UpdateStudentPaymentController = () =>
  import('#controllers/student_payments/update_student_payment_controller')
const CancelStudentPaymentController = () =>
  import('#controllers/student_payments/cancel_student_payment_controller')
const MarkPaymentAsPaidController = () =>
  import('#controllers/student_payments/mark_payment_as_paid_controller')
const CreateStudentPaymentAsaasChargeController = () =>
  import('#controllers/student_payments/create_student_payment_asaas_charge_controller')
const SendStudentPaymentBoletoEmailController = () =>
  import('#controllers/student_payments/send_student_payment_boleto_email_controller')
const GetStudentPaymentBoletoController = () =>
  import('#controllers/student_payments/get_student_payment_boleto_controller')

// Agreements
const CreateAgreementController = () =>
  import('#controllers/agreements/create_agreement_controller')

// Invoices
const ListInvoicesController = () => import('#controllers/invoices/list_invoices_controller')
const MarkStudentInvoicePaidController = () =>
  import('#controllers/invoices/mark_invoice_paid_controller')

// Audits
const ListAuditsController = () => import('#controllers/audits/list_audits_controller')
const ListStudentAuditHistoryController = () =>
  import('#controllers/audits/list_student_audit_history_controller')

// Student Balance Transactions
const ListStudentBalanceTransactionsController = () =>
  import('#controllers/student_balance_transactions/list_student_balance_transactions_controller')
const ShowStudentBalanceTransactionController = () =>
  import('#controllers/student_balance_transactions/show_student_balance_transaction_controller')
const CreateStudentBalanceTransactionController = () =>
  import('#controllers/student_balance_transactions/create_student_balance_transaction_controller')
const ListStudentBalanceByStudentController = () =>
  import('#controllers/student_balance_transactions/list_student_balance_by_student_controller')
const GetStudentBalanceController = () =>
  import('#controllers/student_balance_transactions/get_student_balance_controller')

export function registerStudentPaymentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListStudentPaymentsController]).as('studentPayments.index')
      router.post('/', [CreateStudentPaymentController]).as('studentPayments.store')
      router.get('/:id', [ShowStudentPaymentController]).as('studentPayments.show')
      router.put('/:id', [UpdateStudentPaymentController]).as('studentPayments.update')
      router.post('/:id/cancel', [CancelStudentPaymentController]).as('studentPayments.cancel')
      router.post('/:id/mark-paid', [MarkPaymentAsPaidController]).as('studentPayments.markPaid')
      router
        .post('/:id/asaas-charge', [CreateStudentPaymentAsaasChargeController])
        .as('studentPayments.asaasCharge')
      router
        .post('/:id/send-boleto', [SendStudentPaymentBoletoEmailController])
        .as('studentPayments.sendBoleto')
      router.get('/:id/boleto', [GetStudentPaymentBoletoController]).as('studentPayments.getBoleto')
    })
    .prefix('/student-payments')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAgreementApiRoutes() {
  router
    .group(() => {
      router.post('/', [CreateAgreementController]).as('agreements.store')
    })
    .prefix('/agreements')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerInvoiceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListInvoicesController]).as('invoices.index')
      router.post('/:id/mark-paid', [MarkStudentInvoicePaidController]).as('invoices.markPaid')
    })
    .prefix('/invoices')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAuditApiRoutes() {
  router
    .group(() => {
      router.get('/:entityType/:entityId', [ListAuditsController]).as('audits.index')
      router
        .get('/students/:studentId/history', [ListStudentAuditHistoryController])
        .as('audits.studentHistory')
    })
    .prefix('/audits')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerStudentBalanceTransactionApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [ListStudentBalanceTransactionsController])
        .as('studentBalanceTransactions.index')
      router
        .post('/', [CreateStudentBalanceTransactionController])
        .as('studentBalanceTransactions.store')
      router
        .get('/:id', [ShowStudentBalanceTransactionController])
        .as('studentBalanceTransactions.show')
      router
        .get('/:studentId/balance-transactions', [ListStudentBalanceByStudentController])
        .as('studentBalanceTransactions.byStudent')
      router
        .get('/:studentId/balance', [GetStudentBalanceController])
        .as('studentBalanceTransactions.balance')
    })
    .prefix('/student-balance-transactions')
    .use([middleware.auth(), middleware.impersonation()])
}
