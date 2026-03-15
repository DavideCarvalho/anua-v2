import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'

import Canteen from '#models/canteen'
import CanteenItem from '#models/canteen_item'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Canteen item categories API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated users to login', async ({ client }) => {
    const response = await client.get('/api/v1/canteen-items/categories').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('returns unique category list scoped by canteenId', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const canteenA = await Canteen.create({
      schoolId: school.id,
      name: `Cantina A ${Date.now()}`,
      responsibleUserId: user.id,
    })

    const canteenB = await Canteen.create({
      schoolId: school.id,
      name: `Cantina B ${Date.now()}`,
      responsibleUserId: user.id,
    })

    await CanteenItem.createMany([
      {
        canteenId: canteenA.id,
        name: 'Suco de Uva',
        description: null,
        price: 700,
        category: 'BEBIDA',
        isActive: true,
      },
      {
        canteenId: canteenA.id,
        name: 'Suco de Laranja',
        description: null,
        price: 750,
        category: 'BEBIDA',
        isActive: true,
      },
      {
        canteenId: canteenA.id,
        name: 'Salgado Assado',
        description: null,
        price: 900,
        category: 'SALGADO',
        isActive: true,
      },
      {
        canteenId: canteenA.id,
        name: 'Item sem categoria',
        description: null,
        price: 500,
        category: null,
        isActive: true,
      },
      {
        canteenId: canteenB.id,
        name: 'Bolo de Cenoura',
        description: null,
        price: 1100,
        category: 'DOCE',
        isActive: true,
      },
    ])

    const response = await client
      .get('/api/v1/canteen-items/categories')
      .qs({ canteenId: canteenA.id })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()

    assert.deepEqual(body.data, ['BEBIDA', 'SALGADO'])
  })
})
