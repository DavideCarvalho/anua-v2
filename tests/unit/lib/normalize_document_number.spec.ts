import { test } from '@japa/runner'

import { normalizeDocumentNumber } from '#lib/normalize_document_number'

test.group('normalize document number', () => {
  test('removes non digits for CPF', ({ assert }) => {
    assert.equal(normalizeDocumentNumber('315.049.208-48', 'CPF'), '31504920848')
  })

  test('removes non digits for RG', ({ assert }) => {
    assert.equal(normalizeDocumentNumber('12.345.678-9', 'RG'), '123456789')
  })

  test('keeps passport alphanumeric and trims spaces', ({ assert }) => {
    assert.equal(normalizeDocumentNumber('  AB-1234  ', 'PASSPORT'), 'AB-1234')
  })
})
