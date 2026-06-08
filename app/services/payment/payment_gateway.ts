import type User from '#models/user'

export type BillingType = 'BOLETO' | 'PIX' | 'CREDIT_CARD'

export interface CreateChargeInput {
  customerId: string
  billingType: BillingType
  value: number
  dueDate: string
  description: string
  externalReference: string
}

export interface ChargeResult {
  chargeId: string
  status: string
  invoiceUrl: string | null
  bankSlipUrl: string | null
}

export interface PixQrResult {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface ChargeDetails {
  chargeId: string
  status: string
  value: number
  invoiceUrl: string | null
  bankSlipUrl: string | null
  description: string | null
}

export interface PaymentGateway {
  getOrCreateCustomer(user: User): Promise<string>
  createCharge(input: CreateChargeInput): Promise<ChargeResult>
  fetchCharge(chargeId: string): Promise<ChargeDetails>
  fetchPixQr(chargeId: string): Promise<PixQrResult>
  updateCharge(
    chargeId: string,
    input: Partial<Pick<CreateChargeInput, 'value' | 'dueDate' | 'description'>>
  ): Promise<ChargeResult>
  deleteCharge(chargeId: string): Promise<void>
}
