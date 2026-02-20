import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'
import type StudentPayment from '#models/student_payment'
import AsaasService from '#services/asaas_service'

@inject()
export default class CreateInvoiceAsaasChargeController {
  constructor(private asaasService: AsaasService) {}

  async handle(ctx: HttpContext) {
    const { params, response, effectiveUser } = ctx
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
      .preload('earlyDiscounts')
      .first()

    if (!contract?.school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const config = this.asaasService.resolveAsaasConfig(contract.school)
    if (!config) {
      throw AppException.badRequest('Configuração do Asaas não encontrada para esta escola')
    }

    const checkoutPricing = this.resolveCheckoutPricing(invoice, contract)
    const expectedValue = checkoutPricing.totalAmount / 100

    const discountSourcesByEnrollmentId = await this.resolveDiscountSourcesByEnrollmentId(invoice)
    const paymentDescriptions = invoice.payments
      .map((p) => `- ${this.describePayment(p, discountSourcesByEnrollmentId)}`)
      .join('\n')
    const discountDescription =
      checkoutPricing.discountAmount > 0
        ? `\nDesconto antecipacao: -${this.formatCurrency(checkoutPricing.discountAmount)}${checkoutPricing.discountPercentage > 0 ? ` (${checkoutPricing.discountPercentage}%)` : ''}`
        : ''
    const schoolName = contract.school.name
    const chargeDescription = `${schoolName} - Fatura ${String(invoice.month).padStart(2, '0')}/${invoice.year}\n${paymentDescriptions}${discountDescription}`

    // Idempotency: if charge already exists, check if value matches
    if (invoice.paymentGatewayId) {
      const existing = await this.asaasService.fetchAsaasPayment(
        config.apiKey,
        invoice.paymentGatewayId
      )

      // If value and description match, refresh URL and return
      if (
        this.areValuesEquivalent(existing.value, expectedValue) &&
        this.areDescriptionsEquivalent(existing.description, chargeDescription)
      ) {
        invoice.baseAmount = checkoutPricing.baseAmount
        invoice.discountAmount = checkoutPricing.discountAmount
        invoice.totalAmount = checkoutPricing.totalAmount
        invoice.invoiceUrl = existing.bankSlipUrl ?? existing.invoiceUrl ?? invoice.invoiceUrl
        await invoice.save()
        return response.ok({ invoiceUrl: invoice.invoiceUrl })
      }

      // Value mismatch — cancel stale charge and fall through to create new one
      await this.asaasService.deleteAsaasPayment(config.apiKey, invoice.paymentGatewayId)
      invoice.paymentGatewayId = null
      invoice.invoiceUrl = null
      invoice.paymentGateway = null
      invoice.paymentMethod = null
      invoice.baseAmount = checkoutPricing.baseAmount
      invoice.discountAmount = checkoutPricing.discountAmount
      invoice.totalAmount = checkoutPricing.totalAmount
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
    const customerId = await this.asaasService.getOrCreateAsaasCustomer(
      config.apiKey,
      effectiveUser
    )

    // Create charge — totalAmount already includes fine/interest from daily reconciliation
    const charge = await this.asaasService.createAsaasPayment(config.apiKey, {
      customer: customerId,
      billingType,
      value: expectedValue,
      dueDate: DateTime.now().toISODate()!,
      description: chargeDescription,
      externalReference: invoice.id,
    })

    invoice.baseAmount = checkoutPricing.baseAmount
    invoice.discountAmount = checkoutPricing.discountAmount
    invoice.totalAmount = checkoutPricing.totalAmount
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

  private async resolveDiscountSourcesByEnrollmentId(
    invoice: Invoice
  ): Promise<Map<string, 'BOLSA' | 'INDIVIDUAL'>> {
    const enrollmentIds = invoice.payments
      .map((payment) => payment.studentHasLevelId)
      .filter((id): id is string => id !== null)

    if (enrollmentIds.length === 0) {
      return new Map()
    }

    const enrollments = await StudentHasLevel.query()
      .whereIn('id', enrollmentIds)
      .preload('scholarship')
      .preload('individualDiscounts')

    const sourceByEnrollmentId = new Map<string, 'BOLSA' | 'INDIVIDUAL'>()

    for (const enrollment of enrollments) {
      const hasIndividualDiscount = enrollment.individualDiscounts.some((discount) => {
        if (discount.deletedAt || !discount.isValid()) {
          return false
        }

        return (
          Number(discount.discountPercentage ?? 0) > 0 ||
          Number(discount.discountValue ?? 0) > 0 ||
          Number(discount.enrollmentDiscountPercentage ?? 0) > 0 ||
          Number(discount.enrollmentDiscountValue ?? 0) > 0
        )
      })

      if (hasIndividualDiscount) {
        sourceByEnrollmentId.set(enrollment.id, 'INDIVIDUAL')
        continue
      }

      const scholarship = enrollment.scholarship
      const hasScholarshipDiscount =
        !!scholarship &&
        (Number(scholarship.discountPercentage ?? 0) > 0 ||
          Number(scholarship.discountValue ?? 0) > 0 ||
          Number(scholarship.enrollmentDiscountPercentage ?? 0) > 0 ||
          Number(scholarship.enrollmentDiscountValue ?? 0) > 0)

      if (hasScholarshipDiscount) {
        sourceByEnrollmentId.set(enrollment.id, 'BOLSA')
      }
    }

    return sourceByEnrollmentId
  }

  private describePayment(
    payment: StudentPayment,
    discountSourcesByEnrollmentId: Map<string, 'BOLSA' | 'INDIVIDUAL'>
  ): string {
    const contractName = payment.contract?.name
    const installmentInfo =
      payment.installments > 0 ? ` (${payment.installmentNumber}/${payment.installments})` : ''

    const baseDescription = (() => {
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
    })()

    const amountDescription = this.formatCurrency(Number(payment.amount))
    const discountApplied = Math.max(0, Number(payment.totalAmount) - Number(payment.amount))

    if (discountApplied <= 0) {
      return `${baseDescription} - ${amountDescription}`
    }

    const source = payment.studentHasLevelId
      ? discountSourcesByEnrollmentId.get(payment.studentHasLevelId)
      : undefined
    const sourceLabel =
      source === 'BOLSA'
        ? 'desconto bolsa'
        : source === 'INDIVIDUAL'
          ? 'desconto individual'
          : 'desconto'
    const percentageSuffix =
      Number(payment.discountPercentage) > 0 ? ` (${Number(payment.discountPercentage)}%)` : ''

    return `${baseDescription} - ${amountDescription} (${sourceLabel}: -${this.formatCurrency(discountApplied)}${percentageSuffix})`
  }

  private resolveCheckoutPricing(
    invoice: Invoice,
    contract: Contract
  ): {
    baseAmount: number
    discountAmount: number
    discountPercentage: number
    totalAmount: number
  } {
    const baseAmountFromPayments = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )
    const baseAmount = baseAmountFromPayments > 0 ? baseAmountFromPayments : invoice.totalAmount

    const today = DateTime.now().startOf('day')
    const dueDate = invoice.dueDate.startOf('day')
    const daysUntilDue = Math.floor(dueDate.diff(today, 'days').days)

    let discountAmount = 0
    let discountPercentage = 0
    const surchargeAmount = Math.max(
      0,
      Number(invoice.fineAmount ?? 0) + Number(invoice.interestAmount ?? 0)
    )

    if (daysUntilDue > 0 && contract.earlyDiscounts?.length) {
      const eligibleDiscounts = contract.earlyDiscounts.filter(
        (discount) =>
          discount.percentage > 0 && daysUntilDue >= Number(discount.daysBeforeDeadline ?? 0)
      )

      if (eligibleDiscounts.length > 0) {
        const bestPercentage = eligibleDiscounts.reduce(
          (max, discount) => Math.max(max, Number(discount.percentage)),
          0
        )
        discountPercentage = bestPercentage
        discountAmount = Math.round((baseAmount * bestPercentage) / 100)
      }
    }

    const boundedDiscountAmount = Math.max(0, Math.min(baseAmount, discountAmount))
    const totalAmount = Math.max(0, baseAmount + surchargeAmount - boundedDiscountAmount)

    return {
      baseAmount,
      discountAmount: boundedDiscountAmount,
      discountPercentage,
      totalAmount,
    }
  }

  private formatCurrency(valueInCents: number): string {
    return (valueInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  private areDescriptionsEquivalent(current?: string, next?: string): boolean {
    const normalizedCurrent = (current ?? '').replace(/\s+/g, ' ').trim()
    const normalizedNext = (next ?? '').replace(/\s+/g, ' ').trim()
    return normalizedCurrent.length > 0 && normalizedCurrent === normalizedNext
  }

  private areValuesEquivalent(current: number, next: number): boolean {
    const currentInCents = Math.round(Number(current) * 100)
    const nextInCents = Math.round(Number(next) * 100)
    return currentInCents === nextInCents
  }
}
