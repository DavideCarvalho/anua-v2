import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { computeGamified } from '../../../app/middleware/inertia_middleware.js'

test.group('Gamificação — aluno autorresponsável nunca é gamified', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('autorresponsável com birthDate de criança → gamified false', ({ assert }) => {
    const childBirthDate = DateTime.now().minus({ years: 10 }).toISO()!
    const result = computeGamified(
      { isSelfResponsible: true },
      { id: 'student-1', birthDate: childBirthDate, role: { name: 'STUDENT' } }
    )
    assert.isFalse(result)
  })

  test('não-autorresponsável com birthDate de criança → gamified true', ({ assert }) => {
    const childBirthDate = DateTime.now().minus({ years: 10 }).toISO()!
    const result = computeGamified(
      { isSelfResponsible: false },
      { id: 'student-2', birthDate: childBirthDate, role: { name: 'STUDENT' } }
    )
    assert.isTrue(result)
  })
})
