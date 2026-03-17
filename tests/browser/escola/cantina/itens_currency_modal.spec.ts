import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Canteen from '#models/canteen'
import CanteenItem from '#models/canteen_item'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Cantina itens modal com currency input (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('creates item with price in cents from modal currency input', async ({
    visit,
    browserContext,
  }) => {
    const { user, school } = await createEscolaAuthUser()

    const canteen = await Canteen.create({
      schoolId: school.id,
      name: `Cantina Itens ${Date.now()}`,
      responsibleUserId: user.id,
    })

    await browserContext.loginAs(user)

    const page = await visit(`/escola/cantina/itens?canteenId=${canteen.id}`, {
      timeout: 60_000,
    })

    await page.assertExists('text=Itens da Cantina')
    await page.click('button:has-text("Novo Item")')
    await page.assertExists('text=Novo Item da Cantina')

    await page.fill('#create-item-name', 'Suco de Uva Integral')

    const priceInput = page.locator('#create-item-price')
    await priceInput.click()
    await page.keyboard.type('1234')

    const createResponse = page.waitForResponse((response) => {
      return (
        response.request().method() === 'POST' &&
        response.url().includes('/api/v1/canteen-items') &&
        response.status() === 201
      )
    })

    await page.click('button:has-text("Salvar")')
    await createResponse

    await page.assertExists('text=Suco de Uva Integral')
    await page.assertExists('text=R$ 12,34')

    const item = await CanteenItem.query()
      .where('canteenId', canteen.id)
      .where('name', 'Suco de Uva Integral')
      .first()

    if (!item || item.price !== 1234) {
      throw new Error('Expected persisted item with price 1234 cents')
    }
  })
})
