import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import User from '#models/user'

test.group('Matrícula - API Flow', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('creates enrollment via API and student appears in list', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const { academicPeriod, course, contract, level, classEntity } =
      await createEnrollmentFixtures(school)

    // Create enrollment via API
    const enrollmentData = {
      basicInfo: {
        name: 'Aluno Test API',
        email: 'aluno@test.com',
        phone: '11999999999',
        birthDate: new Date(2014, 0, 1).toISOString(),
        documentType: 'CPF',
        documentNumber: '12345678901',
        isSelfResponsible: false,
        whatsappContact: true,
      },
      responsibles: [
        {
          name: 'Responsável Test API',
          email: 'responsavel@test.com',
          phone: '11988888888',
          birthDate: new Date(1985, 0, 1).toISOString(),
          documentType: 'CPF',
          documentNumber: '98765432101',
          isPedagogical: true,
          isFinancial: true,
        },
      ],
      address: {
        zipCode: '01310100',
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 101',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
      medicalInfo: {
        conditions: 'Nenhuma',
        medications: [],
        emergencyContacts: [],
      },
      billing: {
        academicPeriodId: academicPeriod.id,
        courseId: course.id,
        levelId: level.id,
        classId: classEntity.id,
        contractId: contract.id,
        monthlyFee: contract.ammount,
        enrollmentFee: contract.enrollmentValue,
        paymentDate: 5,
        paymentMethod: 'BOLETO',
        installments: 12,
        enrollmentInstallments: 1,
        flexibleInstallments: true,
        scholarshipId: null,
        discountPercentage: 0,
        enrollmentDiscountPercentage: 0,
      },
    }

    const response = await client.post('/api/v1/students/enroll').loginAs(user).json(enrollmentData)

    response.assertStatus(201)

    // Verify student was created in database (Student.id = User.id)
    const studentUser = await User.query().where('name', 'Aluno Test API').first()
    assert.exists(studentUser, 'User should be created in database')

    const student = await Student.query().where('id', studentUser!.id).first()
    assert.exists(student, 'Student should be created in database')

    // Verify enrollment was created
    const enrollment = await StudentHasLevel.query()
      .where('studentId', student!.id)
      .where('academicPeriodId', academicPeriod.id)
      .first()

    assert.exists(enrollment, 'Enrollment should be created')
    assert.equal(enrollment?.levelId, level.id)

    // Verify student appears in list
    const listResponse = await client
      .get('/api/v1/students')
      .qs({ search: 'Aluno Test API' })
      .withGuard('web')
      .loginAs(user)

    listResponse.assertStatus(200)
    const students = listResponse.body().data
    assert.isAbove(students.length, 0, 'Student should appear in list')
  })
})

test.group('Edição de Aluno - API Flow', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('creates, edits and verifies student via API', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const { academicPeriod, course, contract, level, classEntity } =
      await createEnrollmentFixtures(school)

    // Step 1: Create enrollment via API
    const enrollmentData = {
      basicInfo: {
        name: 'Aluno Edição Test',
        email: 'aluno-edicao@test.com',
        phone: '11999999999',
        birthDate: new Date(2014, 0, 1).toISOString(),
        documentType: 'CPF',
        documentNumber: '12345678901',
        isSelfResponsible: false,
        whatsappContact: true,
      },
      responsibles: [
        {
          name: 'Responsável Original',
          email: 'resp-original@test.com',
          phone: '11988888888',
          birthDate: new Date(1985, 0, 1).toISOString(),
          documentType: 'CPF',
          documentNumber: '98765432101',
          isPedagogical: true,
          isFinancial: true,
        },
      ],
      address: {
        zipCode: '01310100',
        street: 'Rua Original',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      },
      medicalInfo: {
        conditions: 'Nenhuma',
        medications: [],
        emergencyContacts: [],
      },
      billing: {
        academicPeriodId: academicPeriod.id,
        courseId: course.id,
        levelId: level.id,
        classId: classEntity.id,
        contractId: contract.id,
        monthlyFee: contract.ammount,
        enrollmentFee: contract.enrollmentValue,
        paymentDate: 5,
        paymentMethod: 'BOLETO',
        installments: 12,
        enrollmentInstallments: 1,
        flexibleInstallments: true,
        scholarshipId: null,
        discountPercentage: 0,
        enrollmentDiscountPercentage: 0,
      },
    }

    const createResponse = await client
      .post('/api/v1/students/enroll')
      .loginAs(user)
      .json(enrollmentData)

    createResponse.assertStatus(201)

    // Get student from database (Student.id = User.id)
    const studentUser = await User.query().where('name', 'Aluno Edição Test').first()
    assert.exists(studentUser)

    const student = await Student.query().where('id', studentUser!.id).first()
    assert.exists(student)
    const studentId = student!.id

    // Step 2: Verify student is in list
    const listResponse1 = await client
      .get('/api/v1/students')
      .qs({ search: 'Aluno Edição Test' })
      .withGuard('web')
      .loginAs(user)

    listResponse1.assertStatus(200)
    const students1 = listResponse1.body().data
    assert.equal(students1.length, 1)

    // Step 3: Edit student basic info
    const updateData = {
      name: 'Aluno Edição Atualizado',
      email: 'aluno-atualizado@test.com',
      phone: '11977777777',
    }

    const updateResponse = await client
      .put(`/api/v1/students/${studentId}`)
      .loginAs(user)
      .json(updateData)

    updateResponse.assertStatus(200)

    // Step 4: Verify student is still in list with updated data
    const listResponse2 = await client
      .get('/api/v1/students')
      .qs({ search: 'Aluno Edição Atualizado' })
      .withGuard('web')
      .loginAs(user)

    listResponse2.assertStatus(200)
    const students2 = listResponse2.body().data
    assert.equal(students2.length, 1)
    assert.equal(students2[0].user.name, 'Aluno Edição Atualizado')

    // Step 5: Verify old name doesn't return results
    const listResponse3 = await client
      .get('/api/v1/students')
      .qs({ search: 'Aluno Edição Test' })
      .withGuard('web')
      .loginAs(user)

    listResponse3.assertStatus(200)
    const students3 = listResponse3.body().data
    assert.equal(students3.length, 0, 'Old name should not return results')
  })
})
