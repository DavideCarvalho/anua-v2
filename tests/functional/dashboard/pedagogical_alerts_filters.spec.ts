import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import Assignment from '#models/assignment'
import Exam from '#models/exam'
import TeacherHasClass from '#models/teacher_has_class'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import {
  createAttendanceAuthFixtures,
  createSecondClassWithSubject,
} from '#tests/helpers/attendance_auth_fixtures'

test.group('Pedagogical alerts filters', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('filters pedagogical alert cards by classId', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)
    const secondClass = await createSecondClassWithSubject(school, fixtures)
    const secondTeacherHasClass = await TeacherHasClass.query()
      .where('classId', secondClass.classEntity.id)
      .firstOrFail()

    const tenDaysAgo = DateTime.now().minus({ days: 10 })

    await Exam.create({
      title: 'Prova Turma A',
      description: null,
      examDate: tenDaysAgo,
      startTime: null,
      endTime: null,
      location: null,
      maxScore: 10,
      weight: 1,
      type: 'WRITTEN',
      status: 'COMPLETED',
      instructions: null,
      schoolId: school.id,
      classId: fixtures.classEntity.id,
      subjectId: fixtures.subject.id,
      teacherId: fixtures.teacher.id,
      academicPeriodId: fixtures.academicPeriod.id,
    })

    await Exam.create({
      title: 'Prova Turma B',
      description: null,
      examDate: tenDaysAgo,
      startTime: null,
      endTime: null,
      location: null,
      maxScore: 10,
      weight: 1,
      type: 'WRITTEN',
      status: 'COMPLETED',
      instructions: null,
      schoolId: school.id,
      classId: secondClass.classEntity.id,
      subjectId: secondClass.subject.id,
      teacherId: secondTeacherHasClass.teacherId,
      academicPeriodId: fixtures.academicPeriod.id,
    })

    await Assignment.create({
      name: 'Atividade Turma A',
      description: null,
      dueDate: tenDaysAgo,
      grade: 10,
      teacherHasClassId: fixtures.teacherHasClass.id,
      academicPeriodId: fixtures.academicPeriod.id,
    })

    await Assignment.create({
      name: 'Atividade Turma B',
      description: null,
      dueDate: tenDaysAgo,
      grade: 10,
      teacherHasClassId: secondTeacherHasClass.id,
      academicPeriodId: fixtures.academicPeriod.id,
    })

    const unfilteredResponse = await client.get('/api/v1/escola/pedagogical-alerts').loginAs(user)
    unfilteredResponse.assertStatus(200)
    const unfilteredBody = unfilteredResponse.body() as any
    assert.equal(unfilteredBody.alerts.examsWithoutGrades?.count, 2)
    assert.equal(unfilteredBody.alerts.overdueActivities?.count, 2)

    const filteredResponse = await client
      .get('/api/v1/escola/pedagogical-alerts')
      .qs({ classId: fixtures.classEntity.id })
      .loginAs(user)

    filteredResponse.assertStatus(200)
    const filteredBody = filteredResponse.body() as any

    assert.equal(filteredBody.alerts.examsWithoutGrades?.count, 1)
    assert.equal(filteredBody.alerts.overdueActivities?.count, 1)
  })
})
