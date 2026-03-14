import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Canteen financial settings API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('upserts settings by creating a new row when missing', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const canteen = await Canteen.create({
      schoolId: school.id,
      name: `Cantina Financeiro ${Date.now()}`,
      responsibleUserId: user.id,
    })

    const response = await client
      .put(`/api/v1/canteens/${canteen.id}/financial-settings`)
      .json({
        pixKey: 'contato@cantina.com.br',
        pixKeyType: 'EMAIL',
        bankName: 'Banco Teste',
        accountHolder: 'Cantina Escolar LTDA',
        platformFeePercentage: 4.5,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()

    assert.equal(body.canteenId, canteen.id)
    assert.equal(body.pixKey, 'contato@cantina.com.br')
    assert.equal(body.pixKeyType, 'EMAIL')
    assert.equal(body.bankName, 'Banco Teste')
    assert.equal(body.accountHolder, 'Cantina Escolar LTDA')
    assert.equal(body.platformFeePercentage, 4.5)

    const persisted = await CanteenFinancialSettings.query().where('canteenId', canteen.id).first()
    assert.exists(persisted)
    assert.equal(persisted?.pixKey, 'contato@cantina.com.br')
    assert.equal(persisted?.pixKeyType, 'EMAIL')
  })

  test('upserts settings by updating existing row', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const canteen = await Canteen.create({
      schoolId: school.id,
      name: `Cantina Financeiro Update ${Date.now()}`,
      responsibleUserId: user.id,
    })

    await CanteenFinancialSettings.create({
      canteenId: canteen.id,
      platformFeePercentage: 2,
      pixKey: 'old@cantina.com.br',
      pixKeyType: 'EMAIL',
      bankName: 'Banco Antigo',
      accountHolder: 'Titular Antigo',
    })

    const response = await client
      .put(`/api/v1/canteens/${canteen.id}/financial-settings`)
      .json({
        pixKey: 'novo@cantina.com.br',
        pixKeyType: 'EMAIL',
        platformFeePercentage: 3,
      })
      .loginAs(user)

    response.assertStatus(200)

    const persisted = await CanteenFinancialSettings.query()
      .where('canteenId', canteen.id)
      .firstOrFail()
    assert.equal(persisted.pixKey, 'novo@cantina.com.br')
    assert.equal(persisted.platformFeePercentage, 3)
    assert.equal(persisted.bankName, 'Banco Antigo')
    assert.equal(persisted.accountHolder, 'Titular Antigo')
  })
})
