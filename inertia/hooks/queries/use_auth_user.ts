import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'
import { tuyau } from '../../lib/api'
import type { UserDto } from '../../lib/types'

type AuthMeRoute = ReturnType<typeof tuyau.$route<'api.v1.auth.me'>>
type AuthMeGet = AuthMeRoute['$get']

export type AuthMeResponse = InferResponseType<AuthMeGet>

export const authUserQueryKey = ['user'] as const

function toIsoString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toISO' in value) {
    const toISO = (value as { toISO?: () => string | null }).toISO
    if (typeof toISO === 'function') {
      return toISO.call(value)
    }
  }

  return String(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return {}
  }

  return value as Record<string, unknown>
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  return String(value ?? '')
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return asString(value)
}

function asBoolean(value: unknown): boolean {
  return Boolean(value)
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function normalizeAuthUser(user: unknown): UserDto {
  const raw = asRecord(user)
  const rawRole = raw.role ? asRecord(raw.role) : null
  const rawSchool = raw.school ? asRecord(raw.school) : null

  return {
    id: asString(raw.id),
    name: asString(raw.name),
    slug: asString(raw.slug),
    email: asNullableString(raw.email),
    phone: asNullableString(raw.phone),
    whatsappContact: asBoolean(raw.whatsappContact),
    birthDate: toIsoString(raw.birthDate),
    documentType: asNullableString(raw.documentType),
    documentNumber: asNullableString(raw.documentNumber),
    imageUrl: asNullableString(raw.imageUrl),
    active: asBoolean(raw.active),
    grossSalary: asNumber(raw.grossSalary),
    roleId: asNullableString(raw.roleId),
    schoolId: asNullableString(raw.schoolId),
    schoolChainId: asNullableString(raw.schoolChainId),
    createdAt: toIsoString(raw.createdAt) ?? '',
    updatedAt: toIsoString(raw.updatedAt),
    role: rawRole
      ? {
          id: asString(rawRole.id),
          name: asString(rawRole.name),
          description: asNullableString(rawRole.description),
        }
      : undefined,
    school: rawSchool
      ? {
          id: asString(rawSchool.id),
          name: asString(rawSchool.name),
          slug: asString(rawSchool.slug),
          legalName: asNullableString(rawSchool.legalName),
          cnpj: asNullableString(rawSchool.cnpj),
          email: asNullableString(rawSchool.email),
          phone: asNullableString(rawSchool.phone),
          logoUrl: asNullableString(rawSchool.logoUrl),
          headerUrl: asNullableString(rawSchool.headerUrl),
          active: asBoolean(rawSchool.active),
          schoolChainId: asNullableString(rawSchool.schoolChainId),
        }
      : undefined,
  }
}

export function useAuthUserQueryOptions(initialUser: UserDto | null) {
  return queryOptions({
    queryKey: authUserQueryKey,
    queryFn: async () => {
      const route = tuyau.$route('api.v1.auth.me')
      const response = await route.$get()

      if (response.error) {
        const error = response.error as
          | { status?: number; value?: { message?: string } }
          | undefined

        if (error?.status === 401 || error?.status === 403) {
          return null
        }

        throw new Error(error?.value?.message || 'Erro ao carregar usuário autenticado')
      }

      return normalizeAuthUser(response.data)
    },
    initialData: initialUser,
    enabled: initialUser !== null,
    staleTime: 1000 * 60,
    retry: false,
  })
}
