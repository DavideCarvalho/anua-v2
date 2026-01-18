import type School from '#models/school'
import type SchoolChain from '#models/school_chain'
import type User from '#models/user'

const DEFAULT_ASAAS_URL = 'https://www.asaas.com/api/v3'

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
  invoiceUrl?: string
  bankSlipUrl?: string
}

interface AsaasRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

function getAsaasBaseUrl() {
  return process.env.ASAAS_URL ?? process.env.ASAAS_API_URL ?? DEFAULT_ASAAS_URL
}

async function asaasRequest<T>(apiKey: string, path: string, options: AsaasRequestOptions) {
  const response = await fetch(`${getAsaasBaseUrl()}${path}`, {
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
    throw new Error(`ASAAS request failed (${response.status}): ${errorBody}`)
  }

  return (await response.json()) as T
}

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

export async function sendAsaasPaymentEmail(apiKey: string, paymentId: string, email?: string) {
  return asaasRequest<Record<string, unknown>>(apiKey, `/payments/${paymentId}/notification`, {
    method: 'POST',
    body: {
      notificationType: 'EMAIL',
      email,
    },
  })
}
