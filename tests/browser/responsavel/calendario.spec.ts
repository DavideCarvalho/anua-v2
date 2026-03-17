import { test } from '@japa/runner'
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

async function waitForResponsibleShellRequests(page: any) {
  const notificationsResponse = page.waitForResponse((response: any) => {
    return (
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/notifications') &&
      response.status() === 200
    )
  })

  const statsResponse = page.waitForResponse((response: any) => {
    return (
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/responsavel/stats') &&
      response.status() === 200
    )
  })

  const calendarResponse = page.waitForResponse((response: any) => {
    return (
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/responsavel/students/') &&
      response.url().includes('/calendar') &&
      response.status() === 200
    )
  })

  await page.reload()
  await Promise.all([notificationsResponse, statsResponse, calendarResponse])
}

async function createUserWithRole(roleName: string, seed: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  return User.create({
    name: `${roleName} ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
}

async function createResponsavelCalendarFixtures(seed: string) {
  const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })

  const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-responsible`)
  const teacherUser = await createUserWithRole('SCHOOL_TEACHER', `${seed}-teacher`)
  const studentUser = await createUserWithRole('STUDENT', `${seed}-student`)

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
    name: `Portugues ${seed}`,
    slug: `portugues-${seed}`,
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

  await Student.create({
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

  await StudentHasResponsible.create({
    studentId: studentUser.id,
    responsibleId: responsible.id,
    isPedagogical: true,
    isFinancial: true,
  })

  const baseDate = DateTime.now().plus({ days: 2 }).startOf('day')

  await Assignment.create({
    name: `Atividade responsavel ${seed}`,
    description: 'Descricao atividade',
    grade: 10,
    dueDate: baseDate,
    teacherHasClassId: teacherHasClass.id,
    academicPeriodId: academicPeriod.id,
  })

  await Exam.create({
    title: `Prova responsavel ${seed}`,
    description: 'Descricao prova',
    examDate: baseDate.plus({ days: 1 }),
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
    title: `Evento responsavel ${seed}`,
    description: 'Descricao evento',
    shortDescription: null,
    type: 'ACADEMIC_EVENT',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    priority: 'NORMAL',
    startDate: baseDate.plus({ days: 2 }),
    endDate: baseDate.plus({ days: 2 }),
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

  await EventAudience.create({ eventId: event.id, scopeType: 'CLASS', scopeId: classEntity.id })

  return {
    responsible,
    studentSlug: studentUser.slug,
    assignmentTitle: `Atividade responsavel ${seed}`,
    examTitle: `Prova responsavel ${seed}`,
    eventTitle: `Evento responsavel ${seed}`,
  }
}

test.group('Calendário responsável (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('opens calendar page with list week month views', async ({ visit, browserContext }) => {
    const seed = `${Date.now()}-calendar-page`
    const fixture = await createResponsavelCalendarFixtures(seed)

    await browserContext.loginAs(fixture.responsible)

    const page = await visit(`/responsavel/calendario?aluno=${fixture.studentSlug}`, {
      timeout: 60_000,
    })

    await waitForResponsibleShellRequests(page)

    await page.assertExists('text=Calendário')
    await page.assertExists('button:has-text("Lista")')
    await page.assertExists('button:has-text("Semana")')
    await page.assertExists('button:has-text("Mês")')

    await page.assertExists(`text=${fixture.assignmentTitle}`)
    await page.assertExists(`text=${fixture.examTitle}`)
    await page.assertExists(`text=${fixture.eventTitle}`)

    await page.click('button:has-text("Semana")')
    await page.assertExists('text=Semana')
    await page.assertExists('button[aria-label="Período anterior"]')
    await page.assertExists('button[aria-label="Próximo período"]')
    await page.click('button:has-text("Mês")')
    await page.assertExists('text=Mês')
    await page.assertExists('button[aria-label="Período anterior"]')
    await page.assertExists('button[aria-label="Próximo período"]')
  })

  test('keeps calendar readonly with no create/edit actions', async ({ visit, browserContext }) => {
    const seed = `${Date.now()}-readonly`
    const fixture = await createResponsavelCalendarFixtures(seed)

    await browserContext.loginAs(fixture.responsible)

    const page = await visit(`/responsavel/calendario?aluno=${fixture.studentSlug}`, {
      timeout: 60_000,
    })

    await waitForResponsibleShellRequests(page)

    await page.assertNotExists('button:has-text("Novo item")')
    await page.assertNotExists('button:has-text("Editar")')
  })
})
