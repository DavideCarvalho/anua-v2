import AppException from '#exceptions/app_exception'
import type School from '#models/school'
import type SchoolChain from '#models/school_chain'
import type User from '#models/user'

const ASAAS_PRODUCTION_URL = 'https://www.asaas.com/api/v3'
const ASAAS_SANDBOX_URL = 'https://sandbox.asaas.com/api/v3'

export class AsaasApiError extends Error {
  status: number
  errors: Array<{ code: string; description: string }>

  constructor(status: number, errors: Array<{ code: string; description: string }>) {
    const descriptions = errors.map((e) => e.description).join('; ')
    super(descriptions || `Erro na API Asaas (${status})`)
    this.name = 'AsaasApiError'
    this.status = status
    this.errors = errors
  }
}

export interface AsaasConfig {
  apiKey: string
  accountId: string | null
  source: 'school' | 'chain'
}

export interface AsaasPaymentResponse {
  id: string
  status: string
  value: number
  dueDate: string
  invoiceUrl?: string
  bankSlipUrl?: string
}

interface AsaasPaymentPayload {
  customer: string
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD'
  value: number
  dueDate: string
  description: string
  externalReference: string
  postalService?: boolean
}

interface AsaasCustomerPayload {
  name: string
  cpfCnpj: string
  email?: string | null
  phone?: string | null
  externalReference?: string
}

interface AsaasCustomerResponse {
  id: string
}

interface AsaasPaymentDetailsResponse {
  id: string
  status: string
  value: number
  invoiceUrl?: string
  bankSlipUrl?: string
}

interface AsaasPixQrCodeResponse {
  encodedImage: string
  payload: string
  expirationDate: string
}

interface AsaasRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export interface NfseConfig {
  enabled: boolean
  municipalServiceCode: string
  municipalServiceName: string
  taxes: {
    iss: number
    cofins?: number
    pis?: number
    csll?: number
    inss?: number
    ir?: number
  }
  deductions?: number
}

export interface AsaasNfseResponse {
  id: string
  status: string
  number?: string
  rpsSerie?: string
  rpsNumber?: string
  pdfUrl?: string
  xmlUrl?: string
  effectiveDate?: string
}

export interface AsaasSubaccountPayload {
  name: string
  email: string
  cpfCnpj: string
  companyType: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION'
  birthDate?: string
  phone?: string
  mobilePhone?: string
  address: string
  addressNumber: string
  complement?: string
  province: string
  postalCode: string
  incomeValue: number
  webhooks?: AsaasWebhookPayload[]
}

export interface AsaasWebhookPayload {
  name: string
  url: string
  email: string
  sendType: string
  interrupted: boolean
  enabled: boolean
  apiVersion: number
  authToken: string
  events: string[]
}

interface AsaasSubaccountResponse {
  id: string
  walletId: string
  apiKey: string
}

interface AsaasDocumentsResponse {
  data: Array<{
    id: string
    status: string
    type: string
    onboardingUrl?: string
  }>
}

export interface AsaasDocumentStatus {
  onboardingUrl: string | null
  allApproved: boolean
}

export default class AsaasService {
  private getAsaasBaseUrl(apiKey?: string): string {
    const envUrl = process.env.ASAAS_URL ?? process.env.ASAAS_API_URL
    if (envUrl) return envUrl

    const key = apiKey || process.env.ASAAS_API_KEY || ''
    if (key.includes('_hmlg_')) return ASAAS_SANDBOX_URL
    return ASAAS_PRODUCTION_URL
  }

  private getMasterApiKey(): string {
    const key = process.env.ASAAS_API_KEY
    if (!key) {
      throw AppException.internalServerError('ASAAS_API_KEY is not configured')
    }
    return key
  }

  private async asaasRequest<T>(apiKey: string, path: string, options: AsaasRequestOptions) {
    const response = await fetch(`${this.getAsaasBaseUrl(apiKey)}${path}`, {
      method: options.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': apiKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let errors: Array<{ code: string; description: string }> = []

      try {
        const parsed = JSON.parse(errorBody)
        errors = parsed.errors ?? []
      } catch {
        errors = [{ code: 'UNKNOWN', description: errorBody }]
      }

      throw new AsaasApiError(response.status, errors)
    }

    return (await response.json()) as T
  }

  resolveAsaasConfig(school: School & { schoolChain?: SchoolChain | null }): AsaasConfig | null {
    const chain = (school.$preloaded.schoolChain as SchoolChain | undefined) ?? school.schoolChain

    if (chain?.asaasApiKey && !chain.allowSchoolsToOverridePaymentConfig) {
      return {
        apiKey: chain.asaasApiKey,
        accountId: chain.asaasAccountId ?? null,
        source: 'chain',
      }
    }

    if (school.asaasApiKey) {
      return {
        apiKey: school.asaasApiKey,
        accountId: school.asaasAccountId ?? null,
        source: 'school',
      }
    }

    if (chain?.asaasApiKey) {
      return {
        apiKey: chain.asaasApiKey,
        accountId: chain.asaasAccountId ?? null,
        source: 'chain',
      }
    }

    return null
  }

  async getOrCreateAsaasCustomer(apiKey: string, user: User) {
    if (user.asaasCustomerId) return user.asaasCustomerId

    if (!user.documentNumber) {
      throw AppException.badRequest('Documento do usuário é obrigatório para gerar cobrança')
    }

    const payload: AsaasCustomerPayload = {
      name: user.name,
      cpfCnpj: user.documentNumber,
      email: user.email,
      phone: user.phone,
      externalReference: user.id,
    }

    const customer = await this.asaasRequest<AsaasCustomerResponse>(apiKey, '/customers', {
      method: 'POST',
      body: payload,
    })

    user.asaasCustomerId = customer.id
    await user.save()

    return customer.id
  }

  async createAsaasPayment(apiKey: string, payload: AsaasPaymentPayload) {
    return this.asaasRequest<AsaasPaymentResponse>(apiKey, '/payments', {
      method: 'POST',
      body: {
        ...payload,
        postalService: payload.postalService ?? false,
      },
    })
  }

  async fetchAsaasPayment(apiKey: string, paymentId: string) {
    return this.asaasRequest<AsaasPaymentDetailsResponse>(apiKey, `/payments/${paymentId}`, {
      method: 'GET',
    })
  }

  async fetchAsaasPixQrCode(apiKey: string, paymentId: string) {
    return this.asaasRequest<AsaasPixQrCodeResponse>(apiKey, `/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
    })
  }

  async deleteAsaasPayment(apiKey: string, paymentId: string) {
    return this.asaasRequest<{ deleted: boolean }>(apiKey, `/payments/${paymentId}`, {
      method: 'DELETE',
    })
  }

  async sendAsaasPaymentEmail(apiKey: string, paymentId: string, email?: string) {
    return this.asaasRequest<Record<string, unknown>>(
      apiKey,
      `/payments/${paymentId}/notification`,
      {
        method: 'POST',
        body: {
          notificationType: 'EMAIL',
          email,
        },
      }
    )
  }

  async createAsaasSubaccount(payload: AsaasSubaccountPayload) {
    const masterApiKey = this.getMasterApiKey()

    return this.asaasRequest<AsaasSubaccountResponse>(masterApiKey, '/accounts', {
      method: 'POST',
      body: payload,
    })
  }

  async updateAsaasSubaccount(accountId: string, payload: AsaasSubaccountPayload) {
    const masterApiKey = this.getMasterApiKey()

    return this.asaasRequest<Record<string, unknown>>(masterApiKey, `/accounts/${accountId}`, {
      method: 'PUT',
      body: payload,
    })
  }

  resolveNfseConfig(school: School & { schoolChain?: SchoolChain | null }): NfseConfig | null {
    const chain = (school.$preloaded.schoolChain as SchoolChain | undefined) ?? school.schoolChain

    let source: School | SchoolChain | null = null
    if (chain?.nfseEnabled && !chain.allowSchoolsToOverridePaymentConfig) {
      source = chain
    } else if (school.nfseEnabled) {
      source = school
    } else if (chain?.nfseEnabled) {
      source = chain
    }

    if (!source) return null

    const code = source.nfseMunicipalServiceCode
    const name = source.nfseMunicipalServiceName
    const iss = source.nfseIssPercentage
    if (!code || !name || iss === null || iss === undefined) return null

    return {
      enabled: true,
      municipalServiceCode: code,
      municipalServiceName: name,
      taxes: {
        iss: Number(iss),
        cofins:
          source.nfseCofinsPercentage !== null && source.nfseCofinsPercentage !== undefined
            ? Number(source.nfseCofinsPercentage)
            : undefined,
        pis:
          source.nfsePisPercentage !== null && source.nfsePisPercentage !== undefined
            ? Number(source.nfsePisPercentage)
            : undefined,
        csll:
          source.nfseCsllPercentage !== null && source.nfseCsllPercentage !== undefined
            ? Number(source.nfseCsllPercentage)
            : undefined,
        inss:
          source.nfseInssPercentage !== null && source.nfseInssPercentage !== undefined
            ? Number(source.nfseInssPercentage)
            : undefined,
        ir:
          source.nfseIrPercentage !== null && source.nfseIrPercentage !== undefined
            ? Number(source.nfseIrPercentage)
            : undefined,
      },
      deductions:
        source.nfseDeductions !== null && source.nfseDeductions !== undefined
          ? source.nfseDeductions
          : undefined,
    }
  }

  async createAsaasNfse(
    apiKey: string,
    data: {
      payment: string
      serviceDescription: string
      observations?: string
      effectiveDate: string
      municipalServiceId?: string
      municipalServiceCode: string
      municipalServiceName: string
      taxes: {
        retainIss: boolean
        iss: number
        cofins?: number
        pis?: number
        csll?: number
        inss?: number
        ir?: number
      }
      deductions?: number
    }
  ) {
    return this.asaasRequest<AsaasNfseResponse>(apiKey, '/invoices', {
      method: 'POST',
      body: data,
    })
  }

  async fetchAsaasNfse(apiKey: string, nfseId: string) {
    return this.asaasRequest<AsaasNfseResponse>(apiKey, `/invoices/${nfseId}`, {
      method: 'GET',
    })
  }

  async cancelAsaasNfse(apiKey: string, nfseId: string) {
    return this.asaasRequest<{ deleted: boolean }>(apiKey, `/invoices/${nfseId}`, {
      method: 'DELETE',
    })
  }

  async fetchAsaasDocumentStatus(apiKey: string): Promise<AsaasDocumentStatus> {
    const response = await this.asaasRequest<AsaasDocumentsResponse>(
      apiKey,
      '/myAccount/documents',
      {
        method: 'GET',
      }
    )

    let onboardingUrl: string | null = null
    const allApproved =
      response.data.length > 0 && response.data.every((doc) => doc.status === 'APPROVED')

    for (const doc of response.data) {
      if (doc.onboardingUrl) {
        onboardingUrl = doc.onboardingUrl
        break
      }
    }

    return { onboardingUrl, allApproved }
  }
}
