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

  const templateSlots = [
    { startTime: '08:00', endTime: '08:50', minutes: 50, isBreak: false },
    { startTime: '08:50', endTime: '09:40', minutes: 50, isBreak: false },
    { startTime: '09:40', endTime: '10:30', minutes: 50, isBreak: false },
    { startTime: '10:30', endTime: '10:50', minutes: 20, isBreak: true },
    { startTime: '10:50', endTime: '11:40', minutes: 50, isBreak: false },
    { startTime: '11:40', endTime: '12:30', minutes: 50, isBreak: false },
    { startTime: '12:30', endTime: '13:20', minutes: 50, isBreak: false },
  ]

  for (const slot of templateSlots) {
    await CalendarSlot.create({
      teacherHasClassId: null,
      classWeekDay: 1,
      startTime: slot.startTime,
      endTime: slot.endTime,
      minutes: slot.minutes,
      calendarId: calendar.id,
      isBreak: slot.isBreak,
    })
  }

  return {
    classId: classEntity.id,
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
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classId, className, academicPeriodName } = await createHorariosFixtures(school.id)

    await browserContext.loginAs(user)

    const horariosPage = await visit('/escola/pedagogico/horarios', {
      timeout: 60_000,
    })

    await horariosPage.assertExists('text=Gerenciar Horários')
    await horariosPage.assertExists('text=Período Letivo')
    await horariosPage.assertExists('text=Turma')

    await horariosPage.assertExists(
      'div:has(> label:has-text("Período Letivo")) [data-slot="select-trigger"]:not([data-disabled])'
    )
    await horariosPage.click(
      'div:has(> label:has-text("Período Letivo")) [data-slot="select-trigger"]:not([data-disabled])'
    )
    await horariosPage.click(`[role="option"]:has-text("${academicPeriodName}")`)

    await horariosPage.assertExists(
      '[data-slot="select-trigger"]:has-text("Selecione uma turma"):not([data-disabled])'
    )
    await horariosPage.click(
      '[data-slot="select-trigger"]:has-text("Selecione uma turma"):not([data-disabled])'
    )
    await horariosPage.click(`[role="option"]:has-text("${className}")`)

    await horariosPage.assertExists('button:has-text("Reconfigurar Grade")')
    await horariosPage.assertExists('button:has-text("Gerar Grade")')
    await horariosPage.assertNotExists('button:has-text("Recarregar")')

    await horariosPage.click('button:has-text("Reconfigurar Grade")')
    await horariosPage.fill('input#startTime', '08:00')
    await horariosPage.fill('input#classesPerDay', '5')
    await horariosPage.click('button:has-text("Aplicar Configuração")')

    await horariosPage.assertExists('text=Configuração da grade não contempla todos os horários')
    const mondayExtraSlotCell = horariosPage
      .locator('tbody tr[class*="bg-muted/30"]')
      .last()
      .locator('td')
      .nth(1)
    const mondayExtraSlotCellClass = (await mondayExtraSlotCell.getAttribute('class')) || ''

    assert.include(mondayExtraSlotCellClass, 'cursor-move')

    await horariosPage.click('button:has-text("Gerar Grade")')
    await horariosPage.assertExists(
      'text=Esta ação vai substituir a grade atual e redistribuir as aulas automaticamente.'
    )
    await horariosPage.assertExists('button:has-text("Cancelar")')
    await horariosPage.assertExists('button:has-text("Gerar nova grade")')

    const generateRoute = `**/api/v1/schedules/class/${classId}/generate`
    let generatedRequestPayload: string | null = null
    await horariosPage.route(generateRoute, async (route) => {
      generatedRequestPayload = route.request().postData()
      await route.continue()
    })

    const generateResponse = horariosPage.waitForResponse((response) => {
      return (
        response.request().method() === 'POST' &&
        response.url().includes(`/api/v1/schedules/class/${classId}/generate`)
      )
    })

    await horariosPage.click('button:has-text("Gerar nova grade")')
    await generateResponse
    await horariosPage.unroute(generateRoute)

    const generatePayload = ((): {
      json?: {
        config?: { classesPerDay?: number; startTime?: string }
        classesPerDay?: number
        startTime?: string
      }
      config?: { classesPerDay?: number; startTime?: string }
      classesPerDay?: number
      startTime?: string
    } | null => {
      if (!generatedRequestPayload) {
        return null
      }

      try {
        return JSON.parse(generatedRequestPayload)
      } catch {
        return null
        }
    })()
    assert.equal(
      generatePayload?.json?.config?.classesPerDay ??
        generatePayload?.config?.classesPerDay ??
        generatePayload?.json?.classesPerDay ??
        generatePayload?.classesPerDay,
      5
    )
    assert.equal(
      generatePayload?.json?.config?.startTime ??
        generatePayload?.config?.startTime ??
        generatePayload?.json?.startTime ??
        generatePayload?.startTime,
      '08:00'
    )

    await horariosPage.assertNotExists(
      'text=Esta ação vai substituir a grade atual e redistribuir as aulas automaticamente.'
    )

    await horariosPage.click('button:has-text("Reconfigurar Grade")')
    await horariosPage.assertExists('text=Configuração da Grade')
    await horariosPage.assertExists('button:has-text("Aplicar Configuração")')
  })
})
