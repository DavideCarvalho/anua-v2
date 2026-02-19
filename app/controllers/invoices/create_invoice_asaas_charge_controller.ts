import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'
import type StudentPayment from '#models/student_payment'
import {
  createAsaasPayment,
  deleteAsaasPayment,
  fetchAsaasPayment,
  getOrCreateAsaasCustomer,
  resolveAsaasConfig,
} from '#services/asaas_service'

export default class CreateInvoiceAsaasChargeController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .preload('payments', (q) => {
        q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        q.preload('contract')
        q.preload('studentHasExtraClass', (eq) => eq.preload('extraClass'))
      })
      .first()

    if (!invoice) {
      throw AppException.notFound('Fatura não encontrada')
    }

    // Validate that the responsible has access to this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', invoice.studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para acessar esta fatura')
    }

    if (invoice.payments.length === 0) {
      throw AppException.badRequest('Fatura sem pagamentos ativos')
    }

    // Resolve school via contract
    const contractId = invoice.payments[0].contractId
    const contract = await Contract.query()
      .where('id', contractId)
      .preload('school', (sq) => sq.preload('schoolChain'))
      .first()

    if (!contract?.school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const config = resolveAsaasConfig(contract.school)
    if (!config) {
      throw AppException.badRequest('Configuração do Asaas não encontrada para esta escola')
    }

    // Idempotency: if charge already exists, check if value matches
    if (invoice.paymentGatewayId) {
      const existing = await fetchAsaasPayment(config.apiKey, invoice.paymentGatewayId)
      const expectedValue = invoice.totalAmount / 100

      // If value matches, refresh URL and return
      if (existing.value === expectedValue) {
        invoice.invoiceUrl = existing.bankSlipUrl ?? existing.invoiceUrl ?? invoice.invoiceUrl
        await invoice.save()
        return response.ok({ invoiceUrl: invoice.invoiceUrl })
      }

      // Value mismatch — cancel stale charge and fall through to create new one
      await deleteAsaasPayment(config.apiKey, invoice.paymentGatewayId)
      invoice.paymentGatewayId = null
      invoice.invoiceUrl = null
      invoice.paymentGateway = null
      invoice.paymentMethod = null
      await invoice.save()
    }

    // Validate CPF — the responsible (effectiveUser) is the payer, not the student
    if (!effectiveUser.documentNumber) {
      throw AppException.badRequest(
        'Responsável financeiro sem CPF cadastrado. Atualize o cadastro antes de pagar.'
      )
    }

    // Resolve billing type from StudentHasLevel payment method
    const billingType = await this.resolveBillingType(invoice)

    // Get or create Asaas customer using the responsible's data
    const customerId = await getOrCreateAsaasCustomer(config.apiKey, effectiveUser)

    // Build rich description for the Asaas charge
    const paymentDescriptions = invoice.payments
      .map((p) => `- ${this.describePayment(p)}`)
      .join('\n')
    const schoolName = contract.school.name
    const chargeDescription = `${schoolName} - Fatura ${String(invoice.month).padStart(2, '0')}/${invoice.year}\n${paymentDescriptions}`

    // Create charge — totalAmount already includes fine/interest from daily reconciliation
    const charge = await createAsaasPayment(config.apiKey, {
      customer: customerId,
      billingType,
      value: invoice.totalAmount / 100,
      dueDate: DateTime.now().toISODate()!,
      description: chargeDescription,
      externalReference: invoice.id,
    })

    invoice.paymentGateway = 'ASAAS'
    invoice.paymentGatewayId = charge.id
    invoice.invoiceUrl = charge.bankSlipUrl ?? charge.invoiceUrl ?? null
    invoice.paymentMethod = billingType
    invoice.status = 'PENDING'
    await invoice.save()

    return response.created({ invoiceUrl: invoice.invoiceUrl })
  }

  private async resolveBillingType(invoice: Invoice): Promise<'BOLETO' | 'PIX' | 'CREDIT_CARD'> {
    const studentHasLevelIds = invoice.payments
      .map((p) => p.studentHasLevelId)
      .filter((id): id is string => id !== null)

    if (studentHasLevelIds.length === 0) {
      return 'BOLETO'
    }

    const enrollments = await StudentHasLevel.query().whereIn('id', studentHasLevelIds)

    const counts: Record<string, number> = {}
    for (const enrollment of enrollments) {
      const method = enrollment.paymentMethod
      if (method) {
        counts[method] = (counts[method] || 0) + 1
      }
    }

    let mostFrequent: string | null = null
    let maxCount = 0
    for (const [method, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        mostFrequent = method
      }
    }

    switch (mostFrequent) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'CREDIT_CARD'
      case 'BOLETO':
      default:
        return 'BOLETO'
    }
  }

  private describePayment(payment: StudentPayment): string {
    const contractName = payment.contract?.name
    const installmentInfo =
      payment.installments > 0 ? ` (${payment.installmentNumber}/${payment.installments})` : ''

    switch (payment.type) {
      case 'TUITION':
        return 'Mensalidade'
      case 'ENROLLMENT':
        return contractName
          ? `Matrícula - ${contractName}${installmentInfo}`
          : `Matrícula${installmentInfo}`
      case 'EXTRA_CLASS':
        return payment.studentHasExtraClass?.extraClass?.name
          ? `Aula Avulsa - ${payment.studentHasExtraClass.extraClass.name}`
          : 'Aula Avulsa'
      case 'COURSE':
        return contractName ? `Curso - ${contractName}` : 'Curso'
      case 'STORE':
        return 'Loja'
      case 'CANTEEN':
        return 'Cantina'
      case 'AGREEMENT':
        return 'Acordo'
      case 'STUDENT_LOAN':
        return 'Empréstimo'
      default:
        return 'Outro'
    }
  }
}
