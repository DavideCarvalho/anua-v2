import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

import AcademicPeriod from '#models/academic_period'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Level from '#models/level'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createHorariosFixtures(schoolId: string) {
  const now = DateTime.now()

  const level = await Level.create({
    name: `Nivel Horarios ${now.toMillis()}`,
    order: 1,
    schoolId,
    contractId: null,
    isActive: true,
  })

  const classEntity = await Class_.create({
    name: `Turma Horarios ${now.toMillis()}`,
    schoolId,
    levelId: level.id,
    isArchived: false,
  })

  const academicPeriod = await AcademicPeriod.create({
    name: `Periodo Horarios ${now.toMillis()}`,
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

  const calendar = await Calendar.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
    name: `Grade Horarios ${now.toMillis()}`,
    isActive: true,
    isCanceled: false,
    isApproved: true,
    canceledForNextCalendarId: null,
  })

  await CalendarSlot.create({
    teacherHasClassId: null,
    classWeekDay: 1,
    startTime: '08:00',
    endTime: '08:50',
    minutes: 50,
    calendarId: calendar.id,
    isBreak: false,
  })

  return {
    className: classEntity.name,
    academicPeriodName: academicPeriod.name,
  }
}

test.group('Horarios pedagogico - reconfigurar e gerar (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('shows reconfigure action separately from generate action when schedule exists', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { className, academicPeriodName } = await createHorariosFixtures(school.id)

    await browserContext.loginAs(user)

    const horariosPage = await visit('/escola/pedagogico/horarios', {
      timeout: 60_000,
    })

    await horariosPage.assertExists('text=Gerenciar Horários')
    await horariosPage.assertExists('text=Período Letivo')
    await horariosPage.assertExists('text=Turma')

    await horariosPage.click('[data-slot="select-trigger"]:has-text("Selecione um período")')
    await horariosPage.click(`[role="option"]:has-text("${academicPeriodName}")`)

    await horariosPage.click('[data-slot="select-trigger"]:has-text("Selecione uma turma")')
    await horariosPage.click(`[role="option"]:has-text("${className}")`)

    await horariosPage.assertExists('button:has-text("Reconfigurar Grade")')
    await horariosPage.assertNotExists('button:has-text("Gerar Grade")')
    await horariosPage.assertNotExists('button:has-text("Recarregar")')

    await horariosPage.click('button:has-text("Reconfigurar Grade")')

    await horariosPage.assertExists('text=Configuração da Grade')
    await horariosPage.assertExists('button:has-text("Gerar Grade")')
    await horariosPage.assertNotExists('button:has-text("Reconfigurar Grade")')
    await horariosPage.assertNotExists('button:has-text("Recarregar")')
  })
})
