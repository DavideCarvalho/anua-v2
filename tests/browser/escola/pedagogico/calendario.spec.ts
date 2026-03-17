import { test } from '@japa/runner'
import { DateTime } from 'luxon'

// beginGlobalTransaction / rollbackGlobalTransaction
// NOTE: this browser spec intentionally avoids a global transaction because
// the page boot triggers many concurrent requests that conflict with a shared trx.

import AcademicPeriod from '#models/academic_period'
import Assignment from '#models/assignment'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Exam from '#models/exam'
import Level from '#models/level'
import Role from '#models/role'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createCalendarPageFixtures(schoolId: string, withSeedItems = true) {
  const now = DateTime.now()
  let assignmentId: string | undefined
  let examId: string | undefined
  const seededAssignmentTitle = `Atividade Calendario ${now.toMillis()}`
  const seededExamTitle = `Prova Bimestral ${now.toMillis()}`

  const level = await Level.create({
    name: `Nivel Calendario ${now.toMillis()}`,
    order: 1,
    schoolId,
    contractId: null,
    isActive: true,
  })

  const classEntity = await Class_.create({
    name: `AAA Turma Calendario ${now.toMillis()}`,
    schoolId,
    levelId: level.id,
    isArchived: false,
  })

  const academicPeriod = await AcademicPeriod.create({
    name: `Periodo ${now.toMillis()}`,
    startDate: now.startOf('month'),
    endDate: now.endOf('month'),
    enrollmentStartDate: null,
    enrollmentEndDate: null,
    isActive: true,
    segment: 'ELEMENTARY',
    isClosed: false,
    minimumGradeOverride: null,
    minimumAttendanceOverride: null,
    schoolId,
    previousAcademicPeriodId: null,
    deletedAt: null,
  })

  await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
  })

  const subject = await Subject.create({
    name: `Matematica ${now.toMillis()}`,
    slug: `matematica-${now.toMillis()}`,
    quantityNeededScheduled: 1,
    schoolId,
  })

  const teacherRole = await Role.firstOrCreate(
    { name: 'SCHOOL_TEACHER' },
    { name: 'SCHOOL_TEACHER' }
  )

  const teacherUser = await User.create({
    name: `Professor ${now.toMillis()}`,
    slug: `prof-${now.toMillis()}`,
    email: `prof-${now.toMillis()}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })

  const teacher = await Teacher.create({ id: teacherUser.id, hourlyRate: 100 })

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

  const calendar = await Calendar.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
    name: `Grade ${now.toMillis()}`,
    isActive: true,
    isCanceled: false,
    isApproved: true,
    canceledForNextCalendarId: null,
  })

  await CalendarSlot.create({
    teacherHasClassId: teacherHasClass.id,
    classWeekDay: now.weekday % 7,
    startTime: '08:00',
    endTime: '08:50',
    minutes: 50,
    calendarId: calendar.id,
    isBreak: false,
  })

  if (withSeedItems) {
    const assignment = await Assignment.create({
      name: seededAssignmentTitle,
      description: 'Criada no fluxo do semanario',
      dueDate: now.startOf('day'),
      grade: 10,
      teacherHasClassId: teacherHasClass.id,
      academicPeriodId: academicPeriod.id,
    })
    assignmentId = assignment.id

    const exam = await Exam.create({
      title: seededExamTitle,
      description: 'Conteudo 1',
      examDate: now.startOf('day'),
      startTime: null,
      endTime: null,
      location: null,
      maxScore: 10,
      weight: 1,
      type: 'WRITTEN',
      status: 'SCHEDULED',
      instructions: null,
      schoolId,
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
      academicPeriodId: academicPeriod.id,
    })
    examId = exam.id
  }

  return {
    classId: classEntity.id,
    className: classEntity.name,
    academicPeriodName: academicPeriod.name,
    subjectName: subject.name,
    assignmentId,
    examId,
    seededAssignmentTitle,
    seededExamTitle,
  }
}

test.group('Calendario pedagogico (browser)', (group) => {
  test('renders semanario views, filters and new item menu', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId } = await createCalendarPageFixtures(school.id)

    await browserContext.loginAs(user)

    const page = await visit(`/escola/pedagogico/calendario?classId=${classId}`, {
      timeout: 60_000,
    })

    await page.assertExists('text=Calendário Pedagógico')
    await page.assertExists('text=Lista')
    await page.assertExists('text=Semana')
    await page.assertExists('text=Mês')
    await page.assertExists('text=Novo item')

    await page.click('text=Mês')
    await page.assertExists('.pedagogical-full-calendar')
    await page.assertExists('text=Dom')
    await page.assertExists('text=Seg')
    await page.assertExists('text=Ter')
    await page.assertExists('text=Qua')
    await page.assertExists('text=Qui')
    await page.assertExists('text=Sex')
    await page.assertExists('text=Sáb')

    await page.click('text=Lista')

    await page.click('button:has-text("Novo item")')
    await page.assertExists('text=Nova Atividade')
    await page.assertExists('text=Nova Prova')
    await page.assertExists('text=Novo Evento')
  })

  test('shows saved items in atividades and provas screens', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createCalendarPageFixtures(school.id)

    await browserContext.loginAs(user)

    const atividadesPage = await visit('/escola/pedagogico/atividades', { timeout: 60_000 })
    await atividadesPage.assertExists('text=Atividade Calendario')

    const provasPage = await visit('/escola/pedagogico/provas', { timeout: 60_000 })
    await provasPage.assertExists('text=Prova Bimestral')
  })

  test('opens assignment modal from semanario menu', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId } = await createCalendarPageFixtures(school.id, false)
    const assignmentTitle = `Atividade UI ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit(`/escola/pedagogico/calendario?classId=${classId}`, {
      timeout: 60_000,
    })

    await calendarioPage.assertExists('button:has-text("Novo item")')
    await calendarioPage.click('[data-slot="select-trigger"]')
    await calendarioPage.keyboard.press('ArrowDown')
    await calendarioPage.keyboard.press('Enter')
    await calendarioPage.click('button:has-text("Novo item")')
    await calendarioPage.click('[data-slot="popover-content"] button:has-text("Nova atividade")')
    await calendarioPage.assertExists('text=Criar nova atividade')
    await calendarioPage.assertNotExists('text=Carregando matérias...')
    await calendarioPage.click('[role="dialog"] [data-slot="select-trigger"]')
    await calendarioPage.keyboard.press('ArrowDown')
    await calendarioPage.keyboard.press('Enter')
    await calendarioPage.fill('input#name', assignmentTitle)
    await calendarioPage.click('input#noGrade')
    await calendarioPage.click('[role="dialog"] button:has-text("Cancelar")')
    await calendarioPage.assertNotExists('text=Criar nova atividade')
  })

  test('opens exam modal from semanario menu', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId } = await createCalendarPageFixtures(school.id, false)
    const examTitle = `Prova UI ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit(`/escola/pedagogico/calendario?classId=${classId}`, {
      timeout: 60_000,
    })

    await calendarioPage.assertExists('button:has-text("Novo item")')
    await calendarioPage.click('[data-slot="select-trigger"]')
    await calendarioPage.keyboard.press('ArrowDown')
    await calendarioPage.keyboard.press('Enter')
    await calendarioPage.click('button:has-text("Novo item")')
    await calendarioPage.click('[data-slot="popover-content"] button:has-text("Nova prova")')
    await calendarioPage.assertExists('text=Criar nova prova')
    await calendarioPage.assertNotExists('text=Carregando matérias...')
    await calendarioPage.click('[role="dialog"] [data-slot="select-trigger"]')
    await calendarioPage.keyboard.press('ArrowDown')
    await calendarioPage.keyboard.press('Enter')
    await calendarioPage.fill('input#title', examTitle)
    await calendarioPage.click('[role="dialog"] button:has-text("Cancelar")')
    await calendarioPage.assertNotExists('text=Criar nova prova')
  })

  test('edits assignment from calendar list', async ({ visit, browserContext, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId, assignmentId, seededAssignmentTitle } = await createCalendarPageFixtures(
      school.id,
      true
    )
    const updatedTitle = `Atividade Editada ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit(`/escola/pedagogico/calendario?classId=${classId}`, {
      timeout: 60_000,
    })

    await calendarioPage.click('text=Lista')
    await calendarioPage.assertExists(`text=${seededAssignmentTitle}`)
    const assignmentDetailsResponse = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/assignments/') &&
        response.status() === 200
      )
    })

    await calendarioPage.click(
      `div.rounded-md.border.p-3:has-text("${seededAssignmentTitle}") button:has-text("Editar")`
    )
    await assignmentDetailsResponse
    await calendarioPage.assertExists('text=Editar atividade')
    const assignmentDialog = '[role="dialog"]:has-text("Editar atividade")'
    await calendarioPage.assertExists(`${assignmentDialog} input#name`)

    const updateResponse = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'PUT' &&
        response.url().includes('/api/v1/assignments/') &&
        response.status() === 200
      )
    })

    const calendarReload = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/pedagogical-calendar') &&
        response.status() === 200
      )
    })

    await calendarioPage.fill(`${assignmentDialog} input#name`, updatedTitle)
    await calendarioPage.click(`${assignmentDialog} button:has-text("Salvar alterações")`)
    await calendarioPage.assertNotExists('text=Editar atividade')

    await updateResponse
    await calendarReload

    const updatedAssignment = await Assignment.findOrFail(assignmentId!)
    assert.equal(updatedAssignment.name, updatedTitle)
  })

  test('edits exam from calendar list and keeps item visible', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId, examId, seededExamTitle } = await createCalendarPageFixtures(school.id, true)
    const updatedTitle = `Prova Editada ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit(`/escola/pedagogico/calendario?classId=${classId}`, {
      timeout: 60_000,
    })

    await calendarioPage.click('text=Lista')
    await calendarioPage.assertExists(`text=${seededExamTitle}`)
    const examDetailsResponse = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/exams/') &&
        response.status() === 200
      )
    })

    await calendarioPage.click(
      `div.rounded-md.border.p-3:has-text("${seededExamTitle}") button:has-text("Editar")`
    )
    await examDetailsResponse
    await calendarioPage.assertExists('text=Editar prova')
    const examDialog = '[role="dialog"]:has-text("Editar prova")'
    await calendarioPage.assertExists(`${examDialog} input#title`)

    const updateResponse = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'PUT' &&
        response.url().includes('/api/v1/exams/') &&
        response.status() === 200
      )
    })

    const calendarReload = calendarioPage.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/pedagogical-calendar') &&
        response.status() === 200
      )
    })

    await calendarioPage.fill(`${examDialog} input#title`, updatedTitle)
    await calendarioPage.click(`${examDialog} button:has-text("Salvar alterações")`)
    await calendarioPage.assertNotExists('text=Editar prova')

    await updateResponse
    await calendarReload

    const updatedExam = await Exam.findOrFail(examId!)
    assert.equal(updatedExam.title, updatedTitle)
  })

  test('opens context step when creating assignment with class filter ALL', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { className, subjectName, academicPeriodName } = await createCalendarPageFixtures(
      school.id,
      false
    )

    await browserContext.loginAs(user)

    const calendarioPage = await visit('/escola/pedagogico/calendario?classId=ALL', {
      timeout: 60_000,
    })

    await calendarioPage.assertExists('button:has-text("Novo item")')
    await calendarioPage.click('button:has-text("Novo item")')
    await calendarioPage.click('[data-slot="popover-content"] button:has-text("Nova atividade")')
    await calendarioPage.assertExists('text=Criar nova atividade')
    await calendarioPage.assertExists('text=Periodo letivo')
    await calendarioPage.assertExists('text=Turma')
    await calendarioPage.assertExists('text=Matéria')
    await calendarioPage.assertNotExists('text=Selecione uma turma para criar atividade')

    // Open the "Periodo letivo" select (first trigger in the dialog) and pick the period by name
    await calendarioPage.click(
      '[role="dialog"] [data-slot="select-trigger"]:has-text("Selecione o período")'
    )
    await calendarioPage.click(`[role="option"]:has-text("${academicPeriodName}")`)
    await calendarioPage.assertExists(
      `[role="dialog"] [data-slot="select-trigger"]:has-text("${academicPeriodName}")`
    )

    await calendarioPage.click(
      '[role="dialog"] [data-slot="select-trigger"]:has-text("Selecione a turma")'
    )
    await calendarioPage.click(`[role="option"]:has-text("${className}")`)
    await calendarioPage.assertExists(
      `[role="dialog"] [data-slot="select-trigger"]:has-text("${className}")`
    )

    await calendarioPage.click(
      '[role="dialog"] [data-slot="select-trigger"]:has-text("Selecione a matéria")'
    )
    await calendarioPage.assertExists(`[role="option"]:has-text("${subjectName}")`)
    await calendarioPage.click(`[role="option"]:has-text("${subjectName}")`)
    await calendarioPage.assertExists(
      `[role="dialog"] [data-slot="select-trigger"]:has-text("${subjectName}")`
    )
  })

  test('shows translated exam type label in edit modal select', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    await createCalendarPageFixtures(school.id, true)

    await browserContext.loginAs(user)

    const provasPage = await visit('/escola/pedagogico/provas', { timeout: 60_000 })
    await provasPage.assertExists('text=Prova Bimestral')
    await provasPage.click('button:has(.lucide-pencil)')
    await provasPage.assertExists('text=Editar prova')
    await provasPage.assertExists(
      '[role="dialog"] [data-slot="select-trigger"]:has-text("Escrita")'
    )
    await provasPage.assertNotExists(
      '[role="dialog"] [data-slot="select-trigger"]:has-text("WRITTEN")'
    )
  })
})
