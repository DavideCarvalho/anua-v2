import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'
import Level from '#models/level'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import type { School } from '#models/school'

export async function createEnrollmentFixtures(school: School) {
  const now = DateTime.now()
  const startDate = now.startOf('year')
  const endDate = now.plus({ years: 1 }).endOf('year')

  const academicPeriod = await AcademicPeriod.create({
    schoolId: school.id,
    name: `Período Teste ${Date.now()}`,
    startDate,
    endDate,
    enrollmentStartDate: startDate,
    enrollmentEndDate: endDate,
    isActive: true,
    segment: 'ELEMENTARY',
    isClosed: false,
  })

  const course = await Course.create({
    schoolId: school.id,
    name: `Curso Teste ${Date.now()}`,
    version: 1,
  })

  const contract = await Contract.create({
    schoolId: school.id,
    academicPeriodId: academicPeriod.id,
    name: `Contrato Teste ${Date.now()}`,
    description: null,
    endDate: endDate,
    enrollmentValue: 10000, // R$ 100,00 em centavos
    ammount: 50000, // R$ 500,00 mensal
    paymentType: 'MONTHLY',
    enrollmentValueInstallments: 1,
    enrollmentPaymentUntilDays: 30,
    installments: 12,
    flexibleInstallments: true,
    isActive: true,
    hasInsurance: false,
  })

  await ContractPaymentDay.create({
    contractId: contract.id,
    day: 5,
  })

  const level = await Level.create({
    schoolId: school.id,
    contractId: contract.id,
    name: `1º Ano ${Date.now()}`,
    order: 1,
    isActive: true,
  })

  const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create({
    courseId: course.id,
    academicPeriodId: academicPeriod.id,
  })

  const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
    levelId: level.id,
    courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
    isActive: true,
  })

  const classEntity = await Class_.create({
    schoolId: school.id,
    levelId: level.id,
    name: `Turma Teste ${Date.now()}`,
    isArchived: false,
  })

  const classHasAcademicPeriod = await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
  })

  return {
    academicPeriod,
    course,
    contract,
    level,
    classEntity,
    classHasAcademicPeriod,
    courseHasAcademicPeriod,
    levelAssignment,
  }
}
