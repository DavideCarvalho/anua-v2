import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Cantina transferencias financial settings (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('saves financial settings from /escola/cantina/transferencias', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()

    const canteen = await Canteen.create({
      schoolId: school.id,
      name: `Cantina Tela Financeiro ${Date.now()}`,
      responsibleUserId: user.id,
    })

    await browserContext.loginAs(user)

    const page = await visit(`/escola/cantina/transferencias?canteenId=${canteen.id}`)

    await page.assertExists('text=Configuração financeira da cantina')

    await page.fill('#canteen-pix-key', 'financeiro@cantina.com.br')
    await page.selectOption('#canteen-pix-key-type', 'EMAIL')
    await page.fill('#canteen-bank-name', 'Banco Teste')
    await page.fill('#canteen-account-holder', 'Cantina Escola LTDA')
    await page.fill('#canteen-platform-fee', '4.2')

    await page.click('button:has-text("Salvar configuração financeira")')

    await page.waitForResponse((response) => {
      return (
        response.request().method() === 'PUT' &&
        response.url().includes(`/api/v1/canteens/${canteen.id}/financial-settings`) &&
        response.status() === 200
      )
    })

    await page.assertExists('text=Configuração financeira salva com sucesso')

    const persisted = await CanteenFinancialSettings.query().where('canteenId', canteen.id).first()
    assert.exists(persisted)
    assert.equal(persisted?.pixKey, 'financeiro@cantina.com.br')
    assert.equal(persisted?.pixKeyType, 'EMAIL')
    assert.equal(persisted?.platformFeePercentage, 4.2)
  })
})
