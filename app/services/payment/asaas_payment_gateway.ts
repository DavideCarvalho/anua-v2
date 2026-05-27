import type User from '#models/user'
import AsaasService from '#services/asaas_service'
import type { AsaasConfig } from '#services/asaas_service'
import type {
  PaymentGateway,
  CreateChargeInput,
  ChargeResult,
  ChargeDetails,
  PixQrResult,
} from './payment_gateway.js'

export default class AsaasPaymentGateway implements PaymentGateway {
  constructor(
    private asaasService: AsaasService,
    private config: AsaasConfig
  ) {}

  async getOrCreateCustomer(user: User): Promise<string> {
    return this.asaasService.getOrCreateAsaasCustomer(this.config.apiKey, user)
  }

  async createCharge(input: CreateChargeInput): Promise<ChargeResult> {
    const result = await this.asaasService.createAsaasPayment(this.config.apiKey, {
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
    })

    return {
      chargeId: result.id,
      status: result.status,
      invoiceUrl: result.invoiceUrl ?? null,
      bankSlipUrl: result.bankSlipUrl ?? null,
    }
  }

  async fetchCharge(chargeId: string): Promise<ChargeDetails> {
    const result = await this.asaasService.fetchAsaasPayment(this.config.apiKey, chargeId)
    return {
      chargeId: result.id,
      status: result.status,
      value: result.value,
      invoiceUrl: result.invoiceUrl ?? null,
      bankSlipUrl: result.bankSlipUrl ?? null,
      description: result.description ?? null,
    }
  }

  async fetchPixQr(chargeId: string): Promise<PixQrResult> {
    const result = await this.asaasService.fetchAsaasPixQrCode(this.config.apiKey, chargeId)
    return {
      encodedImage: result.encodedImage,
      payload: result.payload,
      expirationDate: result.expirationDate,
    }
  }

  async updateCharge(
    chargeId: string,
    input: Partial<Pick<CreateChargeInput, 'value' | 'dueDate' | 'description'>>
  ): Promise<ChargeResult> {
    const result = await this.asaasService.updateAsaasPayment(this.config.apiKey, chargeId, input)
    return {
      chargeId: result.id,
      status: result.status,
      invoiceUrl: result.invoiceUrl ?? null,
      bankSlipUrl: result.bankSlipUrl ?? null,
    }
  }

  async deleteCharge(chargeId: string): Promise<void> {
    await this.asaasService.deleteAsaasPayment(this.config.apiKey, chargeId)
  }
}
