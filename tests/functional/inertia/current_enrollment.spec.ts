import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { pickCurrentEnrollment } from '../../../inertia/lib/current_enrollment.js'

test.group('Current enrollment picker', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('prefers enrollment from active academic period', ({ assert }) => {
    const enrollment = pickCurrentEnrollment(
      {
        classId: 'class-old',
        levels: [
          {
            id: 'enrollment-old',
            classId: 'class-old',
            academicPeriodId: 'period-old',
          },
          {
            id: 'enrollment-current',
            classId: 'class-current',
            levelAssignedToCourseAcademicPeriod: {
              courseHasAcademicPeriod: {
                academicPeriodId: 'period-current',
              },
            },
          },
        ],
      },
      [
        { id: 'period-old', isActive: false },
        { id: 'period-current', isActive: true },
      ]
    )

    assert.equal(enrollment?.id, 'enrollment-current')
  })

  test('falls back to class match when no active period enrollment exists', ({ assert }) => {
    const enrollment = pickCurrentEnrollment(
      {
        classId: 'class-old',
        levels: [
          {
            id: 'enrollment-old',
            classId: 'class-old',
            academicPeriodId: 'period-old',
          },
          {
            id: 'enrollment-other',
            classId: 'class-other',
            academicPeriodId: 'period-other',
          },
        ],
      },
      [
        { id: 'period-old', isActive: false },
        { id: 'period-other', isActive: false },
      ]
    )

    assert.equal(enrollment?.id, 'enrollment-old')
  })
})
