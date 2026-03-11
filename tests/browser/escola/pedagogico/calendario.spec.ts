import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import AcademicPeriod from '#models/academic_period'
import Assignment from '#models/assignment'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Exam from '#models/exam'
import Role from '#models/role'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createCalendarPageFixtures(schoolId: string, withSeedItems = true) {
  const now = DateTime.now()

  const classEntity = await Class_.create({
    name: `1o Ano A ${now.toMillis()}`,
    schoolId,
    levelId: null,
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

  if (withSeedItems) {
    await Assignment.create({
      name: 'Atividade Calendario',
      description: 'Criada no fluxo do semanario',
      dueDate: now.plus({ days: 1 }).startOf('day'),
      grade: 10,
      teacherHasClassId: teacherHasClass.id,
      academicPeriodId: academicPeriod.id,
    })

    await Exam.create({
      title: 'Prova Bimestral',
      description: 'Conteudo 1',
      examDate: now.plus({ days: 2 }).startOf('day'),
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
  }

  return {
    subjectName: subject.name,
  }
}

test.group('Calendario pedagogico (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('renders semanario views, filters and new item menu', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createCalendarPageFixtures(school.id)

    await browserContext.loginAs(user)

    const page = await visit('/escola/pedagogico/calendario', { timeout: 60_000 })

    await page.assertExists('text=Calendário Pedagógico')
    await page.assertExists('text=Lista')
    await page.assertExists('text=Semana')
    await page.assertExists('text=Mês')
    await page.assertExists('text=Novo item')

    await page.click('text=Mês')
    await page.assertExists('.rbc-month-view')

    await page.click('text=Lista')
    await page.assertExists('text=Prova Bimestral')
    await page.assertExists('text=Agendada')

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

  test('creates assignment via semanario and appears in atividades', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { subjectName } = await createCalendarPageFixtures(school.id, false)
    const assignmentTitle = `Atividade UI ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit('/escola/pedagogico/calendario', { timeout: 60_000 })

    await calendarioPage.assertExists('button:has-text("Novo item")')
    await calendarioPage.click('button:has-text("Novo item")')
    await calendarioPage.click('text=Nova Atividade')
    await calendarioPage.assertExists('text=Criar nova atividade')
    await calendarioPage.assertExists(`text=${subjectName}`)
    await calendarioPage.fill('input#name', assignmentTitle)
    await calendarioPage.click('[role="dialog"] [data-slot="select-trigger"]')
    await calendarioPage.keyboard.press('ArrowDown')
    await calendarioPage.keyboard.press('Enter')
    await calendarioPage.click('input#noGrade')
    await calendarioPage.click('[role="dialog"] button:has-text("Salvar")')
    await calendarioPage.assertNotExists('text=Criar nova atividade')

    const atividadesPage = await visit('/escola/pedagogico/atividades', { timeout: 60_000 })
    await atividadesPage.assertExists(`text=${assignmentTitle}`)
  })

  test('creates exam via semanario and appears in provas', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    const { subjectName } = await createCalendarPageFixtures(school.id, false)
    const examTitle = `Prova UI ${Date.now()}`

    await browserContext.loginAs(user)

    const calendarioPage = await visit('/escola/pedagogico/calendario', { timeout: 60_000 })

    await calendarioPage.assertExists('button:has-text("Novo item")')
    await calendarioPage.click('button:has-text("Novo item")')
    await calendarioPage.click('text=Nova Prova')
    await calendarioPage.assertExists('text=Criar nova prova')
    await calendarioPage.assertExists(`text=${subjectName}`)
    await calendarioPage.fill('input#title', examTitle)
    await calendarioPage.click('[role="dialog"] button:has-text("Salvar")')
    await calendarioPage.assertNotExists('text=Criar nova prova')

    const provasPage = await visit('/escola/pedagogico/provas', { timeout: 60_000 })
    await provasPage.assertExists(`text=${examTitle}`)
  })
})
