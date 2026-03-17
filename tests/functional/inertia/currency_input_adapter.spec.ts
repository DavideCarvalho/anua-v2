import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import {
  centsToReaisNumber,
  centsToReaisString,
  reaisNumberToCents,
  reaisStringToCents,
} from '../../../inertia/lib/currency_input_adapter.js'

test.group('Currency input adapter', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('converts cents to reais number', ({ assert }) => {
    assert.equal(centsToReaisNumber(0), 0)
    assert.equal(centsToReaisNumber(1), 0.01)
    assert.equal(centsToReaisNumber(12345), 123.45)
  })

  test('converts reais number to cents', ({ assert }) => {
    assert.equal(reaisNumberToCents(0), 0)
    assert.equal(reaisNumberToCents(0.01), 1)
    assert.equal(reaisNumberToCents(12.34), 1234)
    assert.equal(reaisNumberToCents(199.999), 20000)
  })

  test('converts reais string to cents safely', ({ assert }) => {
    assert.equal(reaisStringToCents('0'), 0)
    assert.equal(reaisStringToCents('12.34'), 1234)
    assert.equal(reaisStringToCents(' 12.34 '), 1234)
    assert.equal(reaisStringToCents(''), 0)
    assert.equal(reaisStringToCents(undefined), 0)
    assert.equal(reaisStringToCents(null), 0)
    assert.equal(reaisStringToCents('invalid'), 0)
  })

  test('converts cents to reais string', ({ assert }) => {
    assert.equal(centsToReaisString(0), '0')
    assert.equal(centsToReaisString(150), '1.5')
    assert.equal(centsToReaisString(12345), '123.45')
  })
})
