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

interface AsaasRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

function getAsaasBaseUrl(apiKey?: string): string {
  // Explicit env var override takes priority
  const envUrl = process.env.ASAAS_URL ?? process.env.ASAAS_API_URL
  if (envUrl) return envUrl

  // Auto-detect sandbox vs production from api key
  const key = apiKey || process.env.ASAAS_API_KEY || ''
  return key.includes('_hmlg_') ? ASAAS_SANDBOX_URL : ASAAS_PRODUCTION_URL
}

async function asaasRequest<T>(apiKey: string, path: string, options: AsaasRequestOptions) {
  const response = await fetch(`${getAsaasBaseUrl(apiKey)}${path}`, {
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

// --- NFS-e types ---

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

// --- Config resolution ---

export function resolveAsaasConfig(
  school: School & { schoolChain?: SchoolChain | null }
): AsaasConfig | null {
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

export async function getOrCreateAsaasCustomer(apiKey: string, user: User) {
  if (user.asaasCustomerId) {
    return user.asaasCustomerId
  }

  if (!user.documentNumber) {
    throw new Error('Documento do usuário é obrigatório para gerar cobrança')
  }

  const payload: AsaasCustomerPayload = {
    name: user.name,
    cpfCnpj: user.documentNumber,
    email: user.email,
    phone: user.phone,
    externalReference: user.id,
  }

  const customer = await asaasRequest<AsaasCustomerResponse>(apiKey, '/customers', {
    method: 'POST',
    body: payload,
  })

  user.asaasCustomerId = customer.id
  await user.save()

  return customer.id
}

export async function createAsaasPayment(apiKey: string, payload: AsaasPaymentPayload) {
  return asaasRequest<AsaasPaymentResponse>(apiKey, '/payments', {
    method: 'POST',
    body: {
      ...payload,
      postalService: payload.postalService ?? false,
    },
  })
}

export async function fetchAsaasPayment(apiKey: string, paymentId: string) {
  return asaasRequest<AsaasPaymentDetailsResponse>(apiKey, `/payments/${paymentId}`, {
    method: 'GET',
  })
}

interface AsaasPixQrCodeResponse {
  encodedImage: string
  payload: string
  expirationDate: string
}

export async function fetchAsaasPixQrCode(apiKey: string, paymentId: string) {
  return asaasRequest<AsaasPixQrCodeResponse>(apiKey, `/payments/${paymentId}/pixQrCode`, {
    method: 'GET',
  })
}

export async function deleteAsaasPayment(apiKey: string, paymentId: string) {
  return asaasRequest<{ deleted: boolean }>(apiKey, `/payments/${paymentId}`, {
    method: 'DELETE',
  })
}

export async function sendAsaasPaymentEmail(apiKey: string, paymentId: string, email?: string) {
  return asaasRequest<Record<string, unknown>>(apiKey, `/payments/${paymentId}/notification`, {
    method: 'POST',
    body: {
      notificationType: 'EMAIL',
      email,
    },
  })
}

// --- Subaccount management ---

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

export async function createAsaasSubaccount(payload: AsaasSubaccountPayload) {
  const masterApiKey = process.env.ASAAS_API_KEY
  if (!masterApiKey) {
    throw new Error('ASAAS_API_KEY is not configured')
  }

  return asaasRequest<AsaasSubaccountResponse>(masterApiKey, '/accounts', {
    method: 'POST',
    body: payload,
  })
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

/**
 * Fetches document status from Asaas for a subaccount.
 *
 * NOTE: In sandbox, documents are auto-approved with `onboardingUrl: null`.
 * In production, Asaas generates an onboardingUrl for the school to upload docs.
 * The caller should check `allApproved` to handle the sandbox case (skip doc upload).
 *
 * Asaas recommends waiting at least 15s after account creation before calling this.
 * See: https://docs.asaas.com/docs/detalhamento-do-fluxo-de-aprovação-de-subcontas
 */
export function resolveNfseConfig(
  school: School & { schoolChain?: SchoolChain | null }
): NfseConfig | null {
  const chain = (school.$preloaded.schoolChain as SchoolChain | undefined) ?? school.schoolChain

  // Determine source: chain-first if override is disabled, else school, else chain fallback
  let source: School | SchoolChain | null = null
  if (chain?.nfseEnabled && !chain.allowSchoolsToOverridePaymentConfig) {
    source = chain
  } else if (school.nfseEnabled) {
    source = school
  } else if (chain?.nfseEnabled) {
    source = chain
  }

  if (!source) return null

  // Mandatory fields
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

// --- NFS-e API functions ---

export async function createAsaasNfse(
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
  return asaasRequest<AsaasNfseResponse>(apiKey, '/invoices', {
    method: 'POST',
    body: data,
  })
}

export async function fetchAsaasNfse(apiKey: string, nfseId: string) {
  return asaasRequest<AsaasNfseResponse>(apiKey, `/invoices/${nfseId}`, {
    method: 'GET',
  })
}

export async function cancelAsaasNfse(apiKey: string, nfseId: string) {
  return asaasRequest<{ deleted: boolean }>(apiKey, `/invoices/${nfseId}`, {
    method: 'DELETE',
  })
}

export async function fetchAsaasDocumentStatus(apiKey: string): Promise<AsaasDocumentStatus> {
  const response = await asaasRequest<AsaasDocumentsResponse>(apiKey, '/myAccount/documents', {
    method: 'GET',
  })

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
