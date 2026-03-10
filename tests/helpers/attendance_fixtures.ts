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
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Student from '#models/student'
import User from '#models/user'
import Role from '#models/role'
import StudentHasLevel from '#models/student_has_level'
import type School from '#models/school'

export interface AttendanceFixtures {
  academicPeriod: AcademicPeriod
  course: Course
  contract: Contract
  level: Level
  classEntity: Class_
  classHasAcademicPeriod: ClassHasAcademicPeriod
  courseHasAcademicPeriod: CourseHasAcademicPeriod
  levelAssignment: LevelAssignedToCourseHasAcademicPeriod
  subject: Subject
  teacher: Teacher
  teacherHasClass: TeacherHasClass
  calendar: Calendar
  slots: CalendarSlot[]
  students: Student[]
}

export async function createAttendanceFixtures(school: School): Promise<AttendanceFixtures> {
  const now = DateTime.now()
  // Criar período que inclui datas passadas e futuras para ter aulas disponíveis
  const startDate = now.minus({ weeks: 2 })
  const endDate = now.plus({ months: 3 })

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
    enrollmentValue: 10000,
    ammount: 50000,
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

  // Criar Subject
  const subject = await Subject.create({
    schoolId: school.id,
    name: `Matéria Teste ${Date.now()}`,
    slug: `materia-teste-${Date.now()}`,
    quantityNeededScheduled: 1,
  })

  // Criar Teacher
  const teacherRole = await Role.firstOrCreate({ name: 'TEACHER' }, { name: 'TEACHER' })

  const teacherUser = await User.create({
    name: `Professor Teste ${Date.now()}`,
    slug: `professor-${Date.now()}`,
    email: `professor-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })

  const teacher = await Teacher.create({
    id: teacherUser.id,
    hourlyRate: 50,
  })

  // Criar TeacherHasClass
  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 2,
    isActive: true,
  })

  // Criar Calendar
  const calendar = await Calendar.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
    name: 'Calendário Teste',
    isActive: true,
    isCanceled: false,
    isApproved: true,
  })

  // Criar CalendarSlots - 2 horários às quintas-feiras
  const slot1 = await CalendarSlot.create({
    calendarId: calendar.id,
    teacherHasClassId: teacherHasClass.id,
    classWeekDay: 4, // Quinta-feira
    startTime: '08:00',
    endTime: '09:00',
    minutes: 60,
    isBreak: false,
  })

  const slot2 = await CalendarSlot.create({
    calendarId: calendar.id,
    teacherHasClassId: teacherHasClass.id,
    classWeekDay: 4, // Quinta-feira
    startTime: '09:30',
    endTime: '10:30',
    minutes: 60,
    isBreak: false,
  })

  // Criar 2 students com matrícula
  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const students: Student[] = []

  for (let i = 1; i <= 2; i++) {
    const studentUser = await User.create({
      name: `Aluno Teste ${i} ${Date.now()}`,
      slug: `aluno-${i}-${Date.now()}`,
      email: `aluno-${i}-${Date.now()}@test.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: studentUser.id,
      contractId: contract.id,
      balance: 0,
      enrollmentStatus: 'REGISTERED' as const,
      monthlyPaymentAmount: contract.ammount,
      isSelfResponsible: false,
      paymentDate: 5,
      descountPercentage: 0,
    })

    // Criar matrícula na turma
    await StudentHasLevel.create({
      studentId: student.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
      academicPeriodId: academicPeriod.id,
      levelId: level.id,
      classId: classEntity.id,
      contractId: contract.id,
    })

    students.push(student)
  }

  return {
    academicPeriod,
    course,
    contract,
    level,
    classEntity,
    classHasAcademicPeriod,
    courseHasAcademicPeriod,
    levelAssignment,
    subject,
    teacher,
    teacherHasClass,
    calendar,
    slots: [slot1, slot2],
    students,
  }
}
