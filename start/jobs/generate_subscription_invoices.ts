import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import locks from '@adonisjs/lock/services/main'
import { DateTime } from 'luxon'
import Subscription from '#models/subscription'
import SubscriptionInvoice from '#models/subscription_invoice'
import School from '#models/school'
import SchoolChain from '#models/school_chain'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'
import AsaasService from '#services/asaas_service'

const RETRY_INTERVAL_DAYS = 3

interface GenerateSubscriptionInvoicesOptions {
  month?: number
  year?: number
}

export default class GenerateSubscriptionInvoices {
  static async handle(options: GenerateSubscriptionInvoicesOptions = {}) {
    const now = DateTime.now()
    const month = options.month ?? now.month
    const year = options.year ?? now.year
    const dueDate = DateTime.local(year, month, 1)
    const asaasService = await app.container.make(AsaasService)

    let created = 0
    let charged = 0
    let skipped = 0
    let errors = 0

    logger.info('[SUBSCRIPTION_INVOICES] Starting monthly subscription billing', { month, year })

    const subscriptions = await Subscription.query()
      .whereIn('status', ['ACTIVE', 'PAST_DUE'])
      .where((q) => q.whereNotNull('schoolId').orWhereNotNull('schoolChainId'))
      .preload('school', (q) => q.preload('schoolChain'))
      .preload('schoolChain')

    for (const subscription of subscriptions) {
      const lock = locks.createLock(
        `subscription-billing:${subscription.id}:${month}:${year}`,
        '30s'
      )
      const [executed] = await lock.run(async () => {
        try {
          const existing = await SubscriptionInvoice.query()
            .where('subscriptionId', subscription.id)
            .where('month', month)
            .where('year', year)
            .first()

          if (existing) {
            skipped++
            return
          }

          const activeStudents = await this.resolveActiveStudents(subscription)
          const amount =
            subscription.billingModel === 'FIXED_MONTHLY'
              ? Number(subscription.monthlyFixedPrice ?? 0)
              : Number(subscription.pricePerStudent || 0) * activeStudents

          if (amount <= 0) {
            skipped++
            return
          }

          const invoice = await SubscriptionInvoice.create({
            subscriptionId: subscription.id,
            month,
            year,
            activeStudents,
            amount,
            dueDate,
            status: 'PENDING',
            description: `Assinatura ${String(month).padStart(2, '0')}/${year}`,
            metadata: {
              billingModel: subscription.billingModel,
              pricePerStudent: subscription.pricePerStudent,
              monthlyFixedPrice: subscription.monthlyFixedPrice,
            },
          })

          created++

          if (!this.shouldAutoChargeWithCard(subscription)) {
            skipped++
            return
          }

          const chargeResult = await this.createAsaasChargeForInvoice({
            invoice,
            subscription,
            asaasService,
            dueDate,
          })

          if (chargeResult.status === 'charged') {
            charged++
          } else if (chargeResult.status === 'failed') {
            errors++
            invoice.collectionStatus = 'RETRYING'
            invoice.nextChargeRetryAt = DateTime.now().plus({ days: RETRY_INTERVAL_DAYS })
            invoice.lastChargeError = chargeResult.error ?? null
            await invoice.save()
          } else {
            skipped++
          }
        } catch (error) {
          errors++
          logger.error('[SUBSCRIPTION_INVOICES] Error billing subscription', {
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      })

      if (!executed) {
        skipped++
      }
    }

    logger.info('[SUBSCRIPTION_INVOICES] Monthly subscription billing completed', {
      month,
      year,
      created,
      charged,
      skipped,
      errors,
    })

    return { created, charged, skipped, errors }
  }

  private static async resolveActiveStudents(subscription: Subscription): Promise<number> {
    const schoolId = subscription.schoolId
    const schoolChainId = subscription.schoolChainId

    if (schoolId) {
      const result = await User.query()
        .where('schoolId', schoolId)
        .whereNull('deletedAt')
        .whereHas('student', (studentQ) => {
          studentQ.whereHas('levels', (levelQ) => {
            levelQ.whereNull('deletedAt').whereHas('academicPeriod', (periodQ) => {
              periodQ.where('isActive', true).whereNull('deletedAt')
            })
          })
        })
        .countDistinct('id as total')
        .first()

      return Number(result?.$extras.total || 0)
    }

    if (schoolChainId) {
      const result = await User.query()
        .whereNull('deletedAt')
        .whereHas('school', (schoolQ) => {
          schoolQ.where('schoolChainId', schoolChainId)
        })
        .whereHas('student', (studentQ) => {
          studentQ.whereHas('levels', (levelQ) => {
            levelQ.whereNull('deletedAt').whereHas('academicPeriod', (periodQ) => {
              periodQ.where('isActive', true).whereNull('deletedAt')
            })
          })
        })
        .countDistinct('id as total')
        .first()

      return Number(result?.$extras.total || 0)
    }

    return 0
  }

  static async createAsaasChargeForInvoice({
    invoice,
    subscription,
    asaasService,
    dueDate,
  }: {
    invoice: SubscriptionInvoice
    subscription: Subscription
    asaasService: AsaasService
    dueDate: DateTime
  }): Promise<{ status: 'charged' | 'skipped' | 'failed'; error?: string }> {
    const context = await this.resolveBillingContext(subscription)
    if (!context) return { status: 'skipped' }

    const { config, school, schoolChain } = context
    if (!config) return { status: 'skipped' }

    const customerUser = await this.resolveCustomerUser({
      subscription,
      school,
      schoolChain,
      config,
    })
    if (!customerUser || !customerUser.documentNumber) {
      logger.warn('[SUBSCRIPTION_INVOICES] Missing documentNumber for Asaas customer', {
        subscriptionId: subscription.id,
      })
      return { status: 'skipped' }
    }

    const billingType = (subscription.paymentMethod || 'BOLETO') as 'BOLETO' | 'PIX' | 'CREDIT_CARD'
    if (billingType === 'CREDIT_CARD' && !subscription.creditCardToken) {
      return {
        status: 'failed',
        error: 'Cartão de crédito não configurado para cobrança automática',
      }
    }

    try {
      const customerId = await asaasService.getOrCreateAsaasCustomer(config.apiKey, customerUser)
      const entityName = school?.name ?? schoolChain?.name ?? 'Assinatura'

      const charge = await asaasService.createAsaasPayment(config.apiKey, {
        customer: customerId,
        billingType,
        value: invoice.amount / 100,
        dueDate: dueDate.toISODate()!,
        description: `${entityName} - Assinatura ${String(invoice.month).padStart(2, '0')}/${invoice.year}`,
        externalReference: invoice.id,
        creditCardToken:
          billingType === 'CREDIT_CARD' ? (subscription.creditCardToken ?? undefined) : undefined,
      })

      invoice.paymentGatewayId = charge.id
      invoice.invoiceUrl = charge.bankSlipUrl ?? charge.invoiceUrl ?? null
      invoice.paymentMethodSnapshot = billingType
      invoice.lastChargeAttemptAt = DateTime.now()
      invoice.collectionStatus = 'PENDING'
      invoice.nextChargeRetryAt = null
      invoice.lastChargeError = null
      await invoice.save()

      return { status: 'charged' }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao criar cobrança no Asaas'

      logger.error('[SUBSCRIPTION_INVOICES] Failed to create Asaas charge', {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        error: errorMessage,
      })

      invoice.lastChargeAttemptAt = DateTime.now()
      invoice.lastChargeError = errorMessage
      await invoice.save()

      return { status: 'failed', error: errorMessage }
    }
  }

  private static shouldAutoChargeWithCard(subscription: Subscription): boolean {
    return subscription.paymentMethod === 'CREDIT_CARD' && !!subscription.creditCardToken
  }

  private static async resolveBillingContext(subscription: Subscription): Promise<{
    config: ReturnType<AsaasService['resolveAsaasConfig']>
    school: School | null
    schoolChain: SchoolChain | null
  } | null> {
    if (subscription.schoolId) {
      const school =
        subscription.school ??
        (await School.query().where('id', subscription.schoolId).preload('schoolChain').first())

      if (!school) return null

      const asaasService = await app.container.make(AsaasService)
      return {
        config: asaasService.resolveAsaasConfig(school),
        school,
        schoolChain: school.schoolChain ?? null,
      }
    }

    if (!subscription.schoolChainId) return null

    const chain =
      subscription.schoolChain ??
      (await SchoolChain.query().where('id', subscription.schoolChainId).first())

    if (!chain?.asaasApiKey) return null

    return {
      config: {
        apiKey: chain.asaasApiKey,
        accountId: chain.asaasAccountId ?? null,
        source: 'chain',
      },
      school: null,
      schoolChain: chain,
    }
  }

  private static async resolveCustomerUser({
    subscription,
    school,
    schoolChain,
    config,
  }: {
    subscription: Subscription
    school: School | null
    schoolChain: SchoolChain | null
    config: { source: 'school' | 'chain' } | null
  }) {
    if (!config) return null

    const chain = schoolChain ?? school?.schoolChain ?? null
    const hasChain = !!chain
    const isSchoolOverridingChain =
      !!school && !!chain && chain.allowSchoolsToOverridePaymentConfig && !!school.asaasApiKey

    if (
      subscription.schoolId &&
      (!hasChain || isSchoolOverridingChain || config.source === 'school')
    ) {
      return this.getSchoolDirector(subscription.schoolId)
    }

    if (chain?.id) {
      return this.getChainDirector(chain.id)
    }

    if (subscription.schoolId) {
      return this.getSchoolDirector(subscription.schoolId)
    }

    return null
  }

  private static async getSchoolDirector(schoolId: string) {
    return UserHasSchool.query()
      .where('schoolId', schoolId)
      .whereHas('user', (userQ) => {
        userQ
          .whereNull('deletedAt')
          .whereHas('role', (roleQ) => roleQ.where('name', 'SCHOOL_DIRECTOR'))
      })
      .preload('user')
      .orderBy('createdAt', 'asc')
      .first()
      .then((record) => record?.user ?? null)
  }

  private static async getChainDirector(schoolChainId: string) {
    return User.query()
      .where('schoolChainId', schoolChainId)
      .whereNull('deletedAt')
      .whereHas('role', (roleQ) => roleQ.where('name', 'SCHOOL_CHAIN_DIRECTOR'))
      .orderBy('createdAt', 'asc')
      .first()
  }
}
