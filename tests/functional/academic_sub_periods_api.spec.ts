import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import AcademicPeriod from '#models/academic_period'
import AcademicSubPeriod from '#models/academic_sub_period'

test.group('AcademicSubPeriods API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('create a sub-period (happy path)', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods')
      .json({
        name: '1º Bimestre',
        order: 1,
        startDate: DateTime.now().startOf('month').toISO(),
        endDate: DateTime.now().endOf('month').toISO(),
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.name, '1º Bimestre')
    assert.equal(body.order, 1)
    assert.equal(body.academicPeriodId, academicPeriod.id)
    assert.equal(body.schoolId, school.id)
    assert.property(body, 'id')
    assert.property(body, 'slug')
  })

  test('list sub-periods filtered by academicPeriodId', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod1 = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período 1 ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const academicPeriod2 = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período 2 ${Date.now()}`,
      startDate: DateTime.now().plus({ months: 6 }).startOf('month'),
      endDate: DateTime.now().plus({ months: 6 }).endOf('month'),
      enrollmentStartDate: DateTime.now().plus({ months: 6 }).startOf('month'),
      enrollmentEndDate: DateTime.now().plus({ months: 6 }).endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    await AcademicSubPeriod.create({
      name: '1º Bimestre',
      order: 1,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      weight: 1,
      hasRecovery: false,
      academicPeriodId: academicPeriod1.id,
      schoolId: school.id,
    })

    await AcademicSubPeriod.create({
      name: '1º Trimestre',
      order: 1,
      startDate: DateTime.now().plus({ months: 6 }).startOf('month'),
      endDate: DateTime.now().plus({ months: 6 }).endOf('month'),
      weight: 1,
      hasRecovery: false,
      academicPeriodId: academicPeriod2.id,
      schoolId: school.id,
    })

    const response = await client
      .get('/api/v1/academic-sub-periods')
      .qs({ academicPeriodId: academicPeriod1.id })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.property(body, 'data')
    assert.isArray(body.data)
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].academicPeriodId, academicPeriod1.id)
  })

  test('show a single sub-period', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const subPeriod = await AcademicSubPeriod.create({
      name: '1º Bimestre',
      order: 1,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      weight: 1,
      minimumGrade: 6,
      hasRecovery: true,
      academicPeriodId: academicPeriod.id,
      schoolId: school.id,
    })

    const response = await client.get(`/api/v1/academic-sub-periods/${subPeriod.id}`).loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.id, subPeriod.id)
    assert.equal(body.name, '1º Bimestre')
    assert.equal(body.minimumGrade, 6)
    assert.equal(body.hasRecovery, true)
  })

  test('update a sub-period', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const subPeriod = await AcademicSubPeriod.create({
      name: '1º Bimestre',
      order: 1,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      weight: 1,
      hasRecovery: false,
      academicPeriodId: academicPeriod.id,
      schoolId: school.id,
    })

    const response = await client
      .put(`/api/v1/academic-sub-periods/${subPeriod.id}`)
      .json({
        name: '1º Bimestre Atualizado',
        weight: 2,
        hasRecovery: true,
        minimumGrade: 5,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.name, '1º Bimestre Atualizado')
    assert.equal(body.weight, 2)
    assert.equal(body.hasRecovery, true)
    assert.equal(body.minimumGrade, 5)
  })

  test('soft-delete a sub-period', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const subPeriod = await AcademicSubPeriod.create({
      name: '1º Bimestre',
      order: 1,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      weight: 1,
      hasRecovery: false,
      academicPeriodId: academicPeriod.id,
      schoolId: school.id,
    })

    const deleteResponse = await client
      .delete(`/api/v1/academic-sub-periods/${subPeriod.id}`)
      .loginAs(user)

    deleteResponse.assertStatus(200)

    const showResponse = await client
      .get(`/api/v1/academic-sub-periods/${subPeriod.id}`)
      .loginAs(user)

    showResponse.assertStatus(404)
  })

  test('generate sub-periods for BIMESTRAL school', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    await school.merge({ periodStructure: 'BIMESTRAL' }).save()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Bimestral ${Date.now()}`,
      startDate: DateTime.fromISO('2025-02-01'),
      endDate: DateTime.fromISO('2025-12-20'),
      enrollmentStartDate: DateTime.fromISO('2025-01-15'),
      enrollmentEndDate: DateTime.fromISO('2025-02-28'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods/generate')
      .json({
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.equal(body.data.length, 4)
    assert.equal(body.data[0].name, '1º Bimestre')
    assert.equal(body.data[1].name, '2º Bimestre')
    assert.equal(body.data[2].name, '3º Bimestre')
    assert.equal(body.data[3].name, '4º Bimestre')
  })

  test('generate sub-periods for TRIMESTRAL school', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    await school.merge({ periodStructure: 'TRIMESTRAL' }).save()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Trimestral ${Date.now()}`,
      startDate: DateTime.fromISO('2025-02-01'),
      endDate: DateTime.fromISO('2025-12-20'),
      enrollmentStartDate: DateTime.fromISO('2025-01-15'),
      enrollmentEndDate: DateTime.fromISO('2025-02-28'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods/generate')
      .json({
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.equal(body.data.length, 3)
    assert.equal(body.data[0].name, '1º Trimestre')
    assert.equal(body.data[1].name, '2º Trimestre')
    assert.equal(body.data[2].name, '3º Trimestre')
  })

  test('generate sub-periods for SEMESTRAL school', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    await school.merge({ periodStructure: 'SEMESTRAL' }).save()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Semestral ${Date.now()}`,
      startDate: DateTime.fromISO('2025-02-01'),
      endDate: DateTime.fromISO('2025-12-20'),
      enrollmentStartDate: DateTime.fromISO('2025-01-15'),
      enrollmentEndDate: DateTime.fromISO('2025-02-28'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods/generate')
      .json({
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.equal(body.data.length, 2)
    assert.equal(body.data[0].name, '1º Semestre')
    assert.equal(body.data[1].name, '2º Semestre')
  })

  test('generate sub-periods fails if school has no periodStructure', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods/generate')
      .json({
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(400)
  })

  test('generate sub-periods fails if academic period not found', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    await school.merge({ periodStructure: 'BIMESTRAL' }).save()

    const fakeId = '11111111-1111-4111-8111-111111111111'

    const response = await client
      .post('/api/v1/academic-sub-periods/generate')
      .json({
        academicPeriodId: fakeId,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(404)
  })

  test('weight defaults to 1 when creating sub-period', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Período Teste ${Date.now()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: DateTime.now().startOf('month'),
      enrollmentEndDate: DateTime.now().endOf('month'),
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
    })

    const response = await client
      .post('/api/v1/academic-sub-periods')
      .json({
        name: '1º Bimestre',
        order: 1,
        startDate: DateTime.now().startOf('month').toISO(),
        endDate: DateTime.now().endOf('month').toISO(),
        academicPeriodId: academicPeriod.id,
        schoolId: school.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.weight, 1)
  })
})
