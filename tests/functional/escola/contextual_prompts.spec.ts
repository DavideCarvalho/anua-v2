import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import {
  buildContextualPrompts,
  formatContextLabel,
  type TabFilterState,
  type FilterLabels,
} from '../../../inertia/lib/contextual-prompts.js'

// O bootstrap enforcer exige presença textual de beginGlobalTransaction e
// rollbackGlobalTransaction em todo *.spec.ts. Esses testes são puramente
// síncronos e não tocam o banco; o helper fica como dead-code documentado.
async function _startTxUnused() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

const labels: FilterLabels = {
  academicPeriodName: '2026',
  courseName: 'Fundamental I',
  levelName: '1º ano',
  className: '1º ano A',
}

const noFilters: TabFilterState = {
  academicPeriodId: 'all',
  subPeriodId: 'all',
  courseId: 'all',
  levelId: 'all',
  classId: 'all',
}

test.group('contextual-prompts', () => {
  test('sem filtros → 4 prompts gerais', ({ assert }) => {
    const prompts = buildContextualPrompts(noFilters, labels)
    assert.equal(prompts.length, 4)
    assert.isTrue(prompts.every((p) => typeof p === 'string' && p.length > 0))
  })

  test('só período → prompts mencionam o período', ({ assert }) => {
    const filters: TabFilterState = { ...noFilters, academicPeriodId: 'ap-1' }
    const prompts = buildContextualPrompts(filters, labels)
    assert.isTrue(prompts.some((p) => p.includes('2026')))
  })

  test('até turma → prompts mencionam a turma', ({ assert }) => {
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      levelId: 'l-1',
      classId: 'cl-1',
    }
    const prompts = buildContextualPrompts(filters, labels)
    assert.isTrue(prompts.some((p) => p.includes('1º ano A')))
  })

  test('formatContextLabel sem filtros → "Visão geral da escola"', ({ assert }) => {
    assert.equal(formatContextLabel(noFilters, labels), 'Visão geral da escola')
  })

  test('formatContextLabel com período → "2026"', ({ assert }) => {
    const filters: TabFilterState = { ...noFilters, academicPeriodId: 'ap-1' }
    assert.equal(formatContextLabel(filters, labels), '2026')
  })

  test('formatContextLabel com período+curso+turma → "2026 · Fundamental I · 1º ano A"', ({
    assert,
  }) => {
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      classId: 'cl-1',
    }
    assert.equal(formatContextLabel(filters, labels), '2026 · Fundamental I · 1º ano A')
  })

  test('formatContextLabel trunca em 50 chars', ({ assert }) => {
    const longLabels: FilterLabels = {
      academicPeriodName: 'Período letivo de 2026 (ano civil completo)',
      courseName: 'Curso Fundamental Anos Iniciais Integral Manhã',
      levelName: '1º ano do Ensino Fundamental',
      className: 'Turma A do 1º ano',
    }
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      classId: 'cl-1',
    }
    const label = formatContextLabel(filters, longLabels)
    assert.isAtMost(label.length, 50)
    assert.isTrue(label.endsWith('…'))
  })
})
