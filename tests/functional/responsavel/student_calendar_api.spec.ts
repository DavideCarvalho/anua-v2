import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import AcademicPeriod from '#models/academic_period'
import Assignment from '#models/assignment'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Event from '#models/event'
import EventAudience from '#models/event_audience'
import Exam from '#models/exam'
import Level from '#models/level'
import Role from '#models/role'
import School from '#models/school'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'

async function createUserWithRole(roleName: string, seed: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  const user = await User.create({
    name: `${roleName} ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })

  return user
}

async function createStudentCalendarFixtures(seed: string) {
  const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })

  const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-responsible`)
  const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)
  const teacherUser = await createUserWithRole('SCHOOL_TEACHER', `${seed}-teacher`)
  const studentUser = await createUserWithRole('STUDENT', `${seed}-student`)
  const outsiderStudentUser = await createUserWithRole('STUDENT', `${seed}-outsider-student`)

  await UserHasSchool.create({ userId: responsible.id, schoolId: school.id, isDefault: true })
  await UserHasSchool.create({ userId: teacherUser.id, schoolId: school.id, isDefault: true })

  const level = await Level.create({
    name: `Nivel ${seed}`,
    order: 1,
    schoolId: school.id,
    contractId: null,
    isActive: true,
  })

  const classEntity = await Class_.create({
    name: `Turma ${seed}`,
    schoolId: school.id,
    levelId: level.id,
    isArchived: false,
  })

  const otherClass = await Class_.create({
    name: `Turma outra ${seed}`,
    schoolId: school.id,
    levelId: level.id,
    isArchived: false,
  })

  const academicPeriod = await AcademicPeriod.create({
    name: `Periodo ${seed}`,
    startDate: DateTime.now().startOf('month'),
    endDate: DateTime.now().endOf('month'),
    enrollmentStartDate: null,
    enrollmentEndDate: null,
    isActive: true,
    segment: 'ELEMENTARY',
    isClosed: false,
    minimumGradeOverride: null,
    minimumAttendanceOverride: null,
    schoolId: school.id,
    previousAcademicPeriodId: null,
    deletedAt: null,
  })

  await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
  })

  const subject = await Subject.create({
    name: `Matematica ${seed}`,
    slug: `matematica-${seed}`,
    quantityNeededScheduled: 1,
    schoolId: school.id,
  })

  const teacher = await Teacher.create({ id: teacherUser.id, hourlyRate: 50 })

  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 1,
    classWeekDay: null,
    startTime: null,
    endTime: null,
    teacherAvailabilityId: null,
    isActive: true,
  })

  const student = await Student.create({
    id: studentUser.id,
    classId: classEntity.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  const outsiderStudent = await Student.create({
    id: outsiderStudentUser.id,
    classId: otherClass.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  await StudentHasResponsible.create({
    studentId: student.id,
    responsibleId: responsible.id,
    isPedagogical: true,
    isFinancial: true,
  })

  const now = DateTime.now()
  const withinRangeDate = now.plus({ days: 3 }).startOf('day')
  const outsideRangeDate = now.plus({ days: 80 }).startOf('day')

  await Assignment.create({
    name: `Atividade ${seed}`,
    description: 'Descricao atividade',
    grade: 10,
    dueDate: withinRangeDate,
    teacherHasClassId: teacherHasClass.id,
    academicPeriodId: academicPeriod.id,
  })

  await Assignment.create({
    name: `Atividade fora ${seed}`,
    description: 'Fora da janela',
    grade: 10,
    dueDate: outsideRangeDate,
    teacherHasClassId: teacherHasClass.id,
    academicPeriodId: academicPeriod.id,
  })

  await Exam.create({
    title: `Prova ${seed}`,
    description: 'Descricao prova',
    examDate: withinRangeDate.plus({ days: 1 }),
    startTime: null,
    endTime: null,
    location: null,
    maxScore: 10,
    weight: 1,
    type: 'WRITTEN',
    status: 'SCHEDULED',
    instructions: null,
    schoolId: school.id,
    classId: classEntity.id,
    subjectId: subject.id,
    teacherId: teacher.id,
    academicPeriodId: academicPeriod.id,
  })

  const event = await Event.create({
    title: `Evento ${seed}`,
    description: 'Descricao evento',
    shortDescription: null,
    type: 'ACADEMIC_EVENT',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    priority: 'NORMAL',
    startDate: withinRangeDate.plus({ days: 2 }),
    endDate: withinRangeDate.plus({ days: 2 }),
    startTime: null,
    endTime: null,
    isAllDay: true,
    location: null,
    locationDetails: null,
    isOnline: false,
    onlineUrl: null,
    isExternal: false,
    organizerId: null,
    maxParticipants: null,
    currentParticipants: 0,
    requiresRegistration: false,
    registrationDeadline: null,
    requiresParentalConsent: false,
    hasAdditionalCosts: false,
    additionalCostAmount: null,
    additionalCostInstallments: null,
    additionalCostDescription: null,
    allowComments: true,
    sendNotifications: true,
    isRecurring: false,
    recurringPattern: null,
    bannerUrl: null,
    attachments: null,
    tags: null,
    metadata: null,
    schoolId: school.id,
    createdBy: teacherUser.id,
  })

  await EventAudience.create({
    eventId: event.id,
    scopeType: 'CLASS',
    scopeId: classEntity.id,
  })

  return {
    responsible,
    otherResponsible,
    student,
    outsiderStudent,
  }
}

test.group('Responsavel student calendar API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('returns 403 when student is not linked to responsible', async ({ client }) => {
    const seed = `${Date.now()}-forbidden`
    const { otherResponsible, student } = await createStudentCalendarFixtures(seed)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/calendar`)
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('returns assignment, exam and event items for linked student', async ({
    client,
    assert,
  }) => {
    const seed = `${Date.now()}-types`
    const { responsible, student } = await createStudentCalendarFixtures(seed)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/calendar?view=list`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()

    assert.isArray(body.items)
    const sourceTypes = new Set(body.items.map((item: { sourceType: string }) => item.sourceType))
    assert.isTrue(sourceTypes.has('assignment'))
    assert.isTrue(sourceTypes.has('exam'))
    assert.isTrue(sourceTypes.has('event'))
  })

  test('applies from/to range and keeps chronological order', async ({ client, assert }) => {
    const seed = `${Date.now()}-range`
    const { responsible, student } = await createStudentCalendarFixtures(seed)

    const from = DateTime.now().minus({ days: 1 }).toISODate()
    const to = DateTime.now().plus({ days: 10 }).toISODate()

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/calendar?view=week&from=${from}&to=${to}`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()

    const starts = body.items.map((item: { startAt: string }) => new Date(item.startAt).getTime())
    assert.deepEqual(
      starts,
      [...starts].sort((a, b) => a - b)
    )

    const outOfRange = body.items.find(
      (item: { title: string }) => item.title === `Atividade fora ${seed}`
    )
    assert.isUndefined(outOfRange)
  })

  test('returns 400 for invalid from/to', async ({ client }) => {
    const seed = `${Date.now()}-invalid`
    const { responsible, student } = await createStudentCalendarFixtures(seed)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/calendar?from=bad-value&to=also-bad`)
      .loginAs(responsible)

    response.assertStatus(400)
  })
})
