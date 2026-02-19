import EventAudience from '#models/event_audience'
import type EventAudienceModel from '#models/event_audience'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export interface EventAudienceInput {
  audienceWholeSchool?: boolean
  audienceAcademicPeriodIds?: string[]
  audienceLevelIds?: string[]
  audienceClassIds?: string[]
}

export interface EventAudienceResolved {
  audienceWholeSchool: boolean
  audienceAcademicPeriodIds: string[]
  audienceLevelIds: string[]
  audienceClassIds: string[]
}

export class EventAudienceValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EventAudienceValidationError'
  }
}

export function resolveEventAudienceConfig(
  audiences?: EventAudienceModel[]
): EventAudienceResolved {
  if (!audiences || audiences.length === 0) {
    return {
      audienceWholeSchool: true,
      audienceAcademicPeriodIds: [],
      audienceLevelIds: [],
      audienceClassIds: [],
    }
  }

  const audienceWholeSchool = audiences.some((audience) => audience.scopeType === 'SCHOOL')
  const audienceAcademicPeriodIds = audiences
    .filter((audience) => audience.scopeType === 'ACADEMIC_PERIOD')
    .map((audience) => audience.scopeId)
  const audienceLevelIds = audiences
    .filter((audience) => audience.scopeType === 'LEVEL')
    .map((audience) => audience.scopeId)
  const audienceClassIds = audiences
    .filter((audience) => audience.scopeType === 'CLASS')
    .map((audience) => audience.scopeId)

  return {
    audienceWholeSchool,
    audienceAcademicPeriodIds,
    audienceLevelIds,
    audienceClassIds,
  }
}

export async function syncEventAudience(
  trx: TransactionClientContract,
  eventId: string,
  schoolId: string,
  input: EventAudienceInput
) {
  const audienceAcademicPeriodIds = normalizeIds(input.audienceAcademicPeriodIds)
  const audienceLevelIds = normalizeIds(input.audienceLevelIds)
  const audienceClassIds = normalizeIds(input.audienceClassIds)

  const shouldDefaultToWholeSchool =
    audienceAcademicPeriodIds.length === 0 &&
    audienceLevelIds.length === 0 &&
    audienceClassIds.length === 0

  const audienceWholeSchool = input.audienceWholeSchool ?? shouldDefaultToWholeSchool

  if (!audienceWholeSchool && shouldDefaultToWholeSchool) {
    throw new EventAudienceValidationError(
      'Selecione pelo menos um período letivo, ano ou turma, ou marque escola inteira'
    )
  }

  await validateAudienceIds(trx, schoolId, {
    audienceAcademicPeriodIds,
    audienceLevelIds,
    audienceClassIds,
  })

  await EventAudience.query({ client: trx }).where('eventId', eventId).delete()

  const rows: Array<{
    eventId: string
    scopeType: 'SCHOOL' | 'ACADEMIC_PERIOD' | 'LEVEL' | 'CLASS'
    scopeId: string
  }> = []

  if (audienceWholeSchool) {
    rows.push({
      eventId,
      scopeType: 'SCHOOL',
      scopeId: schoolId,
    })
  }

  for (const scopeId of audienceAcademicPeriodIds) {
    rows.push({ eventId, scopeType: 'ACADEMIC_PERIOD', scopeId })
  }

  for (const scopeId of audienceLevelIds) {
    rows.push({ eventId, scopeType: 'LEVEL', scopeId })
  }

  for (const scopeId of audienceClassIds) {
    rows.push({ eventId, scopeType: 'CLASS', scopeId })
  }

  if (rows.length === 0) {
    return
  }

  await EventAudience.createMany(rows, { client: trx })
}

async function validateAudienceIds(
  trx: TransactionClientContract,
  schoolId: string,
  input: {
    audienceAcademicPeriodIds: string[]
    audienceLevelIds: string[]
    audienceClassIds: string[]
  }
) {
  if (input.audienceAcademicPeriodIds.length > 0) {
    const rows = await trx
      .from('AcademicPeriod')
      .whereIn('id', input.audienceAcademicPeriodIds)
      .where('schoolId', schoolId)
      .whereNull('deletedAt')
      .select('id')

    if (rows.length !== input.audienceAcademicPeriodIds.length) {
      throw new EventAudienceValidationError('Período letivo inválido para a escola selecionada')
    }
  }

  if (input.audienceLevelIds.length > 0) {
    const rows = await trx
      .from('Level')
      .whereIn('id', input.audienceLevelIds)
      .where('schoolId', schoolId)
      .select('id')

    if (rows.length !== input.audienceLevelIds.length) {
      throw new EventAudienceValidationError('Ano inválido para a escola selecionada')
    }
  }

  if (input.audienceClassIds.length > 0) {
    const rows = await trx
      .from('Class')
      .whereIn('id', input.audienceClassIds)
      .where('schoolId', schoolId)
      .select('id')

    if (rows.length !== input.audienceClassIds.length) {
      throw new EventAudienceValidationError('Turma invalida para a escola selecionada')
    }
  }
}

function normalizeIds(ids?: string[]) {
  if (!ids || ids.length === 0) {
    return []
  }

  const uniqueIds = new Set<string>()

  for (const id of ids) {
    const trimmedId = id.trim()
    if (!trimmedId) {
      continue
    }

    uniqueIds.add(trimmedId)
  }

  return Array.from(uniqueIds)
}
