import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { resolveSelectValueLabel } from '../../../inertia/lib/select_value_label.js'

test.group('Select value label', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('returns option label when value matches an ID', ({ assert }) => {
    const label = resolveSelectValueLabel('course-1', [
      { value: 'course-1', label: 'Ensino Fundamental' },
      { value: 'course-2', label: 'Ensino Médio' },
    ])

    assert.equal(label, 'Ensino Fundamental')
  })

  test('returns fallback when no option is found', ({ assert }) => {
    const label = resolveSelectValueLabel('course-3', [
      { value: 'course-1', label: 'Ensino Fundamental' },
      { value: 'course-2', label: 'Ensino Médio' },
    ])

    assert.equal(label, 'course-3')
  })
})
