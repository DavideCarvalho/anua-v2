import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Escola simplified layout across modules (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('uses simplified layout in all module entry pages when mode is simple', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const modules = [
      '/escola/administrativo/alunos',
      '/escola/pedagogico/turmas',
      '/escola/pedagogico/calendario',
      '/escola/financeiro/faturas',
      '/escola/cantina/pdv',
      '/escola/comunicados',
    ]

    const page = await visit('/escola')
    await page.click('button:has-text("Visão simplificada")')

    for (const modulePath of modules) {
      const modulePage = await visit(modulePath)
      await modulePage.assertPathContains(modulePath)
      await modulePage.assertExists('[data-testid="escola-simplified-layout"]')
      await modulePage.assertExists('[data-testid="simplified-primary-actions"]')
      await modulePage.assertExists('[data-testid="simplified-basic-list"]')
    }
  })

  test('shows objective invoices table in simplified financeiro/faturas', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.click('button:has-text("Visão simplificada")')

    const faturasPage = await visit('/escola/financeiro/faturas')
    await faturasPage.assertPath('/escola/financeiro/faturas')
    await faturasPage.assertExists('[data-testid="escola-simplified-layout"]')

    await faturasPage.assertExists('[data-testid="simplified-invoices-table"]')

    await faturasPage.assertExists('th:has-text("Aluno")')
    await faturasPage.assertExists('th:has-text("Vencimento")')
    await faturasPage.assertExists('th:has-text("Valor")')
    await faturasPage.assertExists('th:has-text("Ação")')

    await faturasPage.assertNotExists('th:has-text("Referência")')
    await faturasPage.assertNotExists('th:has-text("Descontos")')
    await faturasPage.assertNotExists('th:has-text("Encargos")')
    await faturasPage.assertNotExists('th:has-text("Valor Recebido")')
    await faturasPage.assertNotExists('th:has-text("Total Cobrado")')
    await faturasPage.assertNotExists('th:has-text("Status")')
  })
})
