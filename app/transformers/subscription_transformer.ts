import { BaseTransformer } from '@adonisjs/core/transformers'
import type Subscription from '#models/subscription'
import SchoolTransformer from '#transformers/school_transformer'
import SchoolChainTransformer from '#transformers/school_chain_transformer'
import SubscriptionPlanTransformer from '#transformers/subscription_plan_transformer'
import SubscriptionInvoiceTransformer from '#transformers/subscription_invoice_transformer'

export default class SubscriptionTransformer extends BaseTransformer<Subscription> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'planId',
        'schoolId',
        'schoolChainId',
        'status',
        'billingCycle',
        'billingModel',
        'currentPeriodStart',
        'currentPeriodEnd',
        'trialEndsAt',
        'canceledAt',
        'pausedAt',
        'blockedAt',
        'pricePerStudent',
        'monthlyFixedPrice',
        'activeStudents',
        'monthlyAmount',
        'discount',
        'paymentGatewayId',
        'paymentMethod',
        'creditCardHolderName',
        'creditCardLastFourDigits',
        'creditCardBrand',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      schoolChain: SchoolChainTransformer.transform(this.whenLoaded(this.resource.schoolChain)),
      plan: SubscriptionPlanTransformer.transform(this.whenLoaded(this.resource.plan)),
      invoices: SubscriptionInvoiceTransformer.transform(this.whenLoaded(this.resource.invoices)),
    }
  }
}
