import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import Course from '#models/course'
import Level from '#models/level'

test.group('Escola dashboard view mode (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('switches to simple mode and shows the 6 quick actions', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')

    await page.assertExists('h1:has-text("O que você quer fazer agora?")')
    await page.assertExists('a:has-text("Alunos")')
    await page.assertExists('a:has-text("Turmas")')
    await page.assertExists('a:has-text("Calendário")')
    await page.assertExists('a:has-text("Financeiro")')
    await page.assertExists('a:has-text("Cantina")')
    await page.assertExists('a:has-text("Comunicados")')
  })

  test('persists selected view mode after reload', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.reload()

    await page.assertExists('h1:has-text("O que você quer fazer agora?")')
  })

  test('navigates to alunos from quick actions hub', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.click('a:has-text("Alunos")')

    await page.assertPathContains('/escola/administrativo/alunos')
  })

  test('returns to full mode and shows dashboard tabs', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.click('button:has-text("Visão completa")')

    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertExists('button:has-text("Administrativo")')
  })

  test('keeps simple mode when navigating to another escola module', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.click('a:has-text("Turmas")')

    await page.assertPathContains('/escola/pedagogico/turmas')
    await page.assertExists('[data-testid="escola-simplified-layout"]')
  })

  test('shows mode toggle in top layout and hides bell in simplified mode', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.assertExists('[data-testid="escola-layout-topbar-actions"]')
    await page.assertExists(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )
    await page.assertExists(
      '[data-testid="escola-layout-topbar-actions"] [data-testid="notification-bell"]'
    )

    await page.click(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )

    await page.assertExists('[data-testid="escola-simplified-layout"]')
    await page.assertNotExists('[data-testid="notification-bell"]')
  })

  test('uses simplified layout on novo comunicado and shows simplified audience presets', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.click(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )

    const newAnnouncementPage = await visit('/escola/comunicados/novo')

    await newAnnouncementPage.assertExists('[data-testid="escola-simplified-layout"]')
    await newAnnouncementPage.assertExists('[data-testid="announcement-audience-presets"]')
    await newAnnouncementPage.assertExists('button:has-text("Toda escola")')
    await newAnnouncementPage.assertExists('button:has-text("Por curso")')
    await newAnnouncementPage.assertExists('button:has-text("Por ano")')
    await newAnnouncementPage.assertExists('button:has-text("Por turma")')
    await newAnnouncementPage.assertExists('button:has-text("Por aluno")')

    await newAnnouncementPage.click('button:has-text("Por turma")')
    await newAnnouncementPage.assertExists('[data-testid="announcement-audience-class-options"]')

    await newAnnouncementPage.click('button:has-text("Por aluno")')
    await newAnnouncementPage.assertExists('[data-testid="announcement-audience-student-options"]')
  })

  test('shows view mode buttons on novo comunicado in full mode topbar', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola/comunicados/novo')
    await page.assertPath('/escola/comunicados/novo')

    await page.assertExists(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão completa")'
    )
    await page.assertExists(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )
  })

  test('shows objective simplified invoices table in financeiro/faturas', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola/financeiro/faturas')
    await page.assertPath('/escola/financeiro/faturas')

    await page.click(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )

    await page.assertExists('[data-testid="escola-simplified-layout"]')
    await page.assertExists('[data-testid="simplified-invoices-table"]')
    await page.assertExists('th:has-text("Aluno")')
    await page.assertExists('th:has-text("Vencimento")')
    await page.assertExists('th:has-text("Valor")')
    await page.assertExists('th:has-text("Ação")')

    await page.assertNotExists('th:has-text("Referência")')
    await page.assertNotExists('th:has-text("Total Cobrado")')
    await page.assertNotExists('th:has-text("Status")')
  })

  test('shows context for duplicate audience names and ignores inactive years', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()

    await Course.create({
      name: 'Curso Duplicado',
      schoolId: school.id,
      version: 1,
      coordinatorId: null,
      enrollmentMinimumAge: null,
      enrollmentMaximumAge: null,
      maxStudentsPerClass: null,
    })

    await Course.create({
      name: 'Curso Duplicado',
      schoolId: school.id,
      version: 1,
      coordinatorId: null,
      enrollmentMinimumAge: null,
      enrollmentMaximumAge: null,
      maxStudentsPerClass: null,
    })

    await Level.create({
      name: 'Ano Duplicado',
      order: 1,
      schoolId: school.id,
      contractId: null,
      isActive: true,
    })

    await Level.create({
      name: 'Ano Duplicado',
      order: 2,
      schoolId: school.id,
      contractId: null,
      isActive: true,
    })

    await Level.create({
      name: 'Ano Duplicado',
      order: 3,
      schoolId: school.id,
      contractId: null,
      isActive: false,
    })

    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.click(
      '[data-testid="escola-layout-topbar-actions"] button:has-text("Visão simplificada")'
    )

    const newAnnouncementPage = await visit('/escola/comunicados/novo')
    await newAnnouncementPage.assertExists('[data-testid="escola-simplified-layout"]')

    await newAnnouncementPage.click('button:has-text("Por curso")')
    await newAnnouncementPage.assertExists('text=Curso Duplicado (2)')

    await newAnnouncementPage.click('button:has-text("Por ano")')
    await newAnnouncementPage.assertExists('text=Ano Duplicado (2)')
  })
})
