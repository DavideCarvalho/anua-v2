import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { v7 as uuidv7 } from 'uuid'
import AiThread from '#models/ai_thread'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function startTx() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

test.group('GET /api/v1/ai/threads filtra surface=page', (group) => {
  group.each.setup(startTx)

  test('default exclui threads surface=sheet', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const pageThreadId = uuidv7()
    const sheetThreadId = uuidv7()

    await AiThread.createMany([
      {
        id: pageThreadId,
        userId: user.id,
        schoolId: school.id,
        surface: 'page',
        channel: 'web',
      },
      {
        id: sheetThreadId,
        userId: user.id,
        schoolId: school.id,
        surface: 'sheet',
        channel: 'web',
      },
    ])

    const response = await client.get('/api/v1/ai/threads').loginAs(user)
    response.assertStatus(200)

    const body = response.body() as { id: string }[]
    const ids = body.map((t) => t.id)

    assert.include(ids, pageThreadId)
    assert.notInclude(ids, sheetThreadId)
  })
})
