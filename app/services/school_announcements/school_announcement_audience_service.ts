import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import SchoolAnnouncementAudience from '#models/school_announcement_audience'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'

export interface AnnouncementAudienceInput {
  audienceAcademicPeriodIds?: string[]
  audienceCourseIds?: string[]
  audienceLevelIds?: string[]
  audienceClassIds?: string[]
  audienceStudentIds?: string[]
}

export interface AnnouncementAudienceResolved {
  audienceAcademicPeriodIds: string[]
  audienceCourseIds: string[]
  audienceLevelIds: string[]
  audienceClassIds: string[]
  audienceStudentIds: string[]
}

export class AnnouncementAudienceValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnnouncementAudienceValidationError'
  }
}

export function normalizeAnnouncementAudienceInput(
  input: AnnouncementAudienceInput
): AnnouncementAudienceResolved {
  return {
    audienceAcademicPeriodIds: normalizeIds(input.audienceAcademicPeriodIds),
    audienceCourseIds: normalizeIds(input.audienceCourseIds),
    audienceLevelIds: normalizeIds(input.audienceLevelIds),
    audienceClassIds: normalizeIds(input.audienceClassIds),
    audienceStudentIds: normalizeIds(input.audienceStudentIds),
  }
}

export function ensureAnnouncementAudienceIsSelected(input: AnnouncementAudienceInput) {
  const normalized = normalizeAnnouncementAudienceInput(input)
  const hasAudience =
    normalized.audienceAcademicPeriodIds.length > 0 ||
    normalized.audienceCourseIds.length > 0 ||
    normalized.audienceLevelIds.length > 0 ||
    normalized.audienceClassIds.length > 0 ||
    normalized.audienceStudentIds.length > 0

  if (!hasAudience) {
    throw new AnnouncementAudienceValidationError(
      'Selecione pelo menos um período letivo, curso, ano ou turma antes de publicar'
    )
  }

  return normalized
}

export function resolveAnnouncementAudienceConfig(
  audiences?: SchoolAnnouncementAudience[]
): AnnouncementAudienceResolved {
  if (!audiences || audiences.length === 0) {
    return {
      audienceAcademicPeriodIds: [],
      audienceCourseIds: [],
      audienceLevelIds: [],
      audienceClassIds: [],
      audienceStudentIds: [],
    }
  }

  return {
    audienceAcademicPeriodIds: audiences
      .filter((audience) => audience.scopeType === 'ACADEMIC_PERIOD')
      .map((audience) => audience.scopeId),
    audienceCourseIds: audiences
      .filter((audience) => audience.scopeType === 'COURSE')
      .map((audience) => audience.scopeId),
    audienceLevelIds: audiences
      .filter((audience) => audience.scopeType === 'LEVEL')
      .map((audience) => audience.scopeId),
    audienceClassIds: audiences
      .filter((audience) => audience.scopeType === 'CLASS')
      .map((audience) => audience.scopeId),
    audienceStudentIds: audiences
      .filter((audience) => audience.scopeType === 'STUDENT')
      .map((audience) => audience.scopeId),
  }
}

export async function syncSchoolAnnouncementAudience(
  trx: TransactionClientContract,
  announcementId: string,
  schoolId: string,
  input: AnnouncementAudienceInput
) {
  const normalized = normalizeAnnouncementAudienceInput(input)

  await validateAudienceIds(trx, schoolId, normalized)

  await SchoolAnnouncementAudience.query({ client: trx })
    .where('announcementId', announcementId)
    .delete()

  const rows: Array<{
    announcementId: string
    scopeType: 'ACADEMIC_PERIOD' | 'COURSE' | 'LEVEL' | 'CLASS' | 'STUDENT'
    scopeId: string
  }> = []

  for (const scopeId of normalized.audienceAcademicPeriodIds) {
    rows.push({ announcementId, scopeType: 'ACADEMIC_PERIOD', scopeId })
  }

  for (const scopeId of normalized.audienceCourseIds) {
    rows.push({ announcementId, scopeType: 'COURSE', scopeId })
  }

  for (const scopeId of normalized.audienceLevelIds) {
    rows.push({ announcementId, scopeType: 'LEVEL', scopeId })
  }

  for (const scopeId of normalized.audienceClassIds) {
    rows.push({ announcementId, scopeType: 'CLASS', scopeId })
  }

  for (const scopeId of normalized.audienceStudentIds) {
    rows.push({ announcementId, scopeType: 'STUDENT', scopeId })
  }

  if (rows.length > 0) {
    await SchoolAnnouncementAudience.createMany(rows, { client: trx })
  }

  return normalized
}

export async function resolveAudienceStudentIds(
  schoolId: string,
  input: AnnouncementAudienceInput
): Promise<string[]> {
  const normalized = normalizeAnnouncementAudienceInput(input)
  const studentIds = new Set<string>()

  if (normalized.audienceClassIds.length > 0) {
    const classStudents = await Student.query()
      .whereIn('classId', normalized.audienceClassIds)
      .whereHas('class', (classQuery) => {
        classQuery.where('schoolId', schoolId)
      })
      .select('id')

    for (const student of classStudents) {
      studentIds.add(student.id)
    }
  }

  if (normalized.audienceLevelIds.length > 0) {
    const levelStudents = await StudentHasLevel.query()
      .whereIn('levelId', normalized.audienceLevelIds)
      .whereNull('deletedAt')
      .whereHas('level', (levelQuery) => {
        levelQuery.where('schoolId', schoolId)
      })
      .select('studentId')

    for (const student of levelStudents) {
      studentIds.add(student.studentId)
    }
  }

  if (normalized.audienceAcademicPeriodIds.length > 0) {
    const periodStudents = await StudentHasLevel.query()
      .whereIn('academicPeriodId', normalized.audienceAcademicPeriodIds)
      .whereNull('deletedAt')
      .whereHas('academicPeriod', (periodQuery) => {
        periodQuery.where('schoolId', schoolId).whereNull('deletedAt')
      })
      .select('studentId')

    for (const student of periodStudents) {
      studentIds.add(student.studentId)
    }
  }

  if (normalized.audienceCourseIds.length > 0) {
    const courseStudents = await StudentHasLevel.query()
      .whereNull('deletedAt')
      .whereHas('levelAssignedToCourseAcademicPeriod', (assignmentQuery) => {
        assignmentQuery.whereHas('courseHasAcademicPeriod', (coursePeriodQuery) => {
          coursePeriodQuery
            .whereIn('courseId', normalized.audienceCourseIds)
            .whereHas('course', (courseQuery) => {
              courseQuery.where('schoolId', schoolId)
            })
        })
      })
      .select('studentId')

    for (const student of courseStudents) {
      studentIds.add(student.studentId)
    }
  }

  if (normalized.audienceStudentIds.length > 0) {
    const directStudents = await Student.query()
      .whereIn('id', normalized.audienceStudentIds)
      .whereHas('class', (classQuery) => {
        classQuery.where('schoolId', schoolId)
      })
      .select('id')

    for (const student of directStudents) {
      studentIds.add(student.id)
    }
  }

  return Array.from(studentIds)
}

async function validateAudienceIds(
  trx: TransactionClientContract,
  schoolId: string,
  input: AnnouncementAudienceResolved
) {
  if (input.audienceAcademicPeriodIds.length > 0) {
    const rows = await trx
      .from('AcademicPeriod')
      .whereIn('id', input.audienceAcademicPeriodIds)
      .where('schoolId', schoolId)
      .whereNull('deletedAt')
      .select('id')

    if (rows.length !== input.audienceAcademicPeriodIds.length) {
      throw new AnnouncementAudienceValidationError(
        'Período letivo inválido para a escola selecionada'
      )
    }
  }

  if (input.audienceCourseIds.length > 0) {
    const rows = await trx
      .from('Course')
      .whereIn('id', input.audienceCourseIds)
      .where('schoolId', schoolId)
      .select('id')

    if (rows.length !== input.audienceCourseIds.length) {
      throw new AnnouncementAudienceValidationError('Curso inválido para a escola selecionada')
    }
  }

  if (input.audienceLevelIds.length > 0) {
    const rows = await trx
      .from('Level')
      .whereIn('id', input.audienceLevelIds)
      .where('schoolId', schoolId)
      .select('id')

    if (rows.length !== input.audienceLevelIds.length) {
      throw new AnnouncementAudienceValidationError('Ano inválido para a escola selecionada')
    }
  }

  if (input.audienceClassIds.length > 0) {
    const rows = await trx
      .from('Class')
      .whereIn('id', input.audienceClassIds)
      .where('schoolId', schoolId)
      .select('id')

    if (rows.length !== input.audienceClassIds.length) {
      throw new AnnouncementAudienceValidationError('Turma inválida para a escola selecionada')
    }
  }

  if (input.audienceStudentIds.length > 0) {
    const rows = await trx
      .from('Student')
      .innerJoin('Class', 'Class.id', 'Student.classId')
      .whereIn('Student.id', input.audienceStudentIds)
      .where('Class.schoolId', schoolId)
      .select('Student.id')

    if (rows.length !== input.audienceStudentIds.length) {
      throw new AnnouncementAudienceValidationError('Aluno inválido para a escola selecionada')
    }
  }
}

function normalizeIds(ids?: string[]) {
  if (!ids || ids.length === 0) {
    return []
  }

  const uniqueIds = new Set<string>()

  for (const id of ids) {
    const trimmed = id.trim()
    if (trimmed) {
      uniqueIds.add(trimmed)
    }
  }

  return Array.from(uniqueIds)
}
