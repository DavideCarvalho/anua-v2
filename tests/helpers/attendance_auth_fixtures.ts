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
import UserHasSchool from '#models/user_has_school'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import type School from '#models/school'

export interface AttendanceAuthFixtures {
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
  directorUser: User
  coordinatorUser: User
  teacherUser: User
  responsibleUser: User
}

export async function createAttendanceAuthFixtures(
  school: School
): Promise<AttendanceAuthFixtures> {
  const now = DateTime.now()
  const startDate = now.minus({ weeks: 2 })
  const endDate = now.plus({ months: 3 })

  // Create Academic Period
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

  // Create Course
  const course = await Course.create({
    schoolId: school.id,
    name: `Curso Teste ${Date.now()}`,
    version: 1,
  })

  // Create Contract
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

  // Create Level
  const level = await Level.create({
    schoolId: school.id,
    contractId: contract.id,
    name: `1º Ano ${Date.now()}`,
    order: 1,
    isActive: true,
  })

  // Create relationships
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

  // Create Subject
  const subject = await Subject.create({
    schoolId: school.id,
    name: `Matéria Teste ${Date.now()}`,
    slug: `materia-teste-${Date.now()}`,
    quantityNeededScheduled: 1,
  })

  // Create roles
  const directorRole = await Role.firstOrCreate(
    { name: 'SCHOOL_DIRECTOR' },
    { name: 'SCHOOL_DIRECTOR' }
  )
  const coordinatorRole = await Role.firstOrCreate(
    { name: 'SCHOOL_COORDINATOR' },
    { name: 'SCHOOL_COORDINATOR' }
  )
  const teacherRole = await Role.firstOrCreate(
    { name: 'SCHOOL_TEACHER' },
    { name: 'SCHOOL_TEACHER' }
  )
  const responsibleRole = await Role.firstOrCreate(
    { name: 'STUDENT_RESPONSIBLE' },
    { name: 'STUDENT_RESPONSIBLE' }
  )

  // Create Director User
  const directorUser = await User.create({
    name: `Diretor Teste ${Date.now()}`,
    slug: `diretor-${Date.now()}`,
    email: `diretor-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: directorRole.id,
  })
  await UserHasSchool.create({ userId: directorUser.id, schoolId: school.id, isDefault: true })

  // Create Coordinator User
  const coordinatorUser = await User.create({
    name: `Coordenador Teste ${Date.now()}`,
    slug: `coordenador-${Date.now()}`,
    email: `coordenador-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: coordinatorRole.id,
  })
  await UserHasSchool.create({ userId: coordinatorUser.id, schoolId: school.id, isDefault: true })

  // Associate coordinator with level
  await CoordinatorHasLevel.create({
    coordinatorId: coordinatorUser.id,
    levelAssignedToCourseHasAcademicPeriodId: levelAssignment.id,
  })

  // Create Teacher User
  const teacherUser = await User.create({
    name: `Professor Teste ${Date.now()}`,
    slug: `professor-${Date.now()}`,
    email: `professor-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })
  await UserHasSchool.create({ userId: teacherUser.id, schoolId: school.id, isDefault: true })

  // Create Teacher record
  const teacher = await Teacher.create({
    id: teacherUser.id,
    hourlyRate: 50,
  })

  // Create TeacherHasClass (associate teacher with class and subject)
  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 2,
    isActive: true,
  })

  // Create Calendar
  const calendar = await Calendar.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
    name: 'Calendário Teste',
    isActive: true,
    isCanceled: false,
    isApproved: true,
  })

  // Create CalendarSlots - 2 horários às quintas-feiras
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

  // Create 2 students with enrollment
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

  // Create Responsible User for first student
  const responsibleUser = await User.create({
    name: `Responsável Teste ${Date.now()}`,
    slug: `responsavel-${Date.now()}`,
    email: `responsavel-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: responsibleRole.id,
  })
  await UserHasSchool.create({ userId: responsibleUser.id, schoolId: school.id, isDefault: true })

  // Associate responsible with first student
  await StudentHasResponsible.create({
    responsibleId: responsibleUser.id,
    studentId: students[0].id,
    isPedagogical: true,
    isFinancial: true,
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
    subject,
    teacher,
    teacherHasClass,
    calendar,
    slots: [slot1, slot2],
    students,
    directorUser,
    coordinatorUser,
    teacherUser,
    responsibleUser,
  }
}

export async function createSecondSubjectWithTeacher(
  school: School,
  fixtures: AttendanceAuthFixtures
): Promise<{ subject: Subject; teacherUser: User; teacherHasClass: TeacherHasClass }> {
  // Create a second subject
  const subject = await Subject.create({
    schoolId: school.id,
    name: `Matéria 2 Teste ${Date.now()}`,
    slug: `materia-2-teste-${Date.now()}`,
    quantityNeededScheduled: 1,
  })

  // Create another teacher
  const teacherRole = await Role.firstOrCreate(
    { name: 'SCHOOL_TEACHER' },
    { name: 'SCHOOL_TEACHER' }
  )
  const teacherUser = await User.create({
    name: `Professor 2 Teste ${Date.now()}`,
    slug: `professor-2-${Date.now()}`,
    email: `professor-2-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })
  await UserHasSchool.create({ userId: teacherUser.id, schoolId: school.id, isDefault: true })

  const teacher = await Teacher.create({
    id: teacherUser.id,
    hourlyRate: 50,
  })

  // Create TeacherHasClass for the second subject
  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: fixtures.classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 2,
    isActive: true,
  })

  // Create additional slot for this subject
  await CalendarSlot.create({
    calendarId: fixtures.calendar.id,
    teacherHasClassId: teacherHasClass.id,
    classWeekDay: 2, // Terça-feira
    startTime: '10:00',
    endTime: '11:00',
    minutes: 60,
    isBreak: false,
  })

  return { subject, teacherUser, teacherHasClass }
}

export async function createSecondClassWithSubject(
  school: School,
  fixtures: AttendanceAuthFixtures
): Promise<{ classEntity: Class_; subject: Subject }> {
  // Create a second class in the same level
  const classEntity = await Class_.create({
    schoolId: school.id,
    levelId: fixtures.level.id,
    name: `Turma 2 Teste ${Date.now()}`,
    isArchived: false,
  })

  await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: fixtures.academicPeriod.id,
  })

  // Create a subject for this class
  const subject = await Subject.create({
    schoolId: school.id,
    name: `Matéria Turma 2 Teste ${Date.now()}`,
    slug: `materia-turma-2-teste-${Date.now()}`,
    quantityNeededScheduled: 1,
  })

  // Create a teacher for this class
  const teacherRole = await Role.firstOrCreate(
    { name: 'SCHOOL_TEACHER' },
    { name: 'SCHOOL_TEACHER' }
  )
  const teacherUser = await User.create({
    name: `Professor Turma 2 Teste ${Date.now()}`,
    slug: `professor-turma-2-${Date.now()}`,
    email: `professor-turma-2-${Date.now()}@test.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })
  await UserHasSchool.create({ userId: teacherUser.id, schoolId: school.id, isDefault: true })

  const teacher = await Teacher.create({
    id: teacherUser.id,
    hourlyRate: 50,
  })

  // Create TeacherHasClass
  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 2,
    isActive: true,
  })

  // Create Calendar for this class
  const calendar = await Calendar.create({
    classId: classEntity.id,
    academicPeriodId: fixtures.academicPeriod.id,
    name: 'Calendário Turma 2 Teste',
    isActive: true,
    isCanceled: false,
    isApproved: true,
  })

  // Create slot
  await CalendarSlot.create({
    calendarId: calendar.id,
    teacherHasClassId: teacherHasClass.id,
    classWeekDay: 3, // Quarta-feira
    startTime: '14:00',
    endTime: '15:00',
    minutes: 60,
    isBreak: false,
  })

  return { classEntity, subject }
}
