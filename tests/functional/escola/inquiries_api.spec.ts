import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import Teacher from '#models/teacher'
import Subject from '#models/subject'
import Class_ from '#models/class'
import Level from '#models/level'
import Course from '#models/course'
import AcademicPeriod from '#models/academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import TeacherHasClass from '#models/teacher_has_class'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'

async function createUserWithRole(roleName: string, seed: string, schoolId?: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  const data: {
    name: string
    slug: string
    email: string
    active: boolean
    whatsappContact: boolean
    grossSalary: number
    roleId: string
    schoolId?: string
  } = {
    name: `${roleName} User ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  }

  if (schoolId) {
    data.schoolId = schoolId
  }

  return User.create(data)
}

test.group('Escola inquiries API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('teacher can list inquiries for students in their class even without explicit recipient row', async ({
    client,
    assert,
  }) => {
    const seed = `teacher-list-${Date.now()}`

    const school = await School.create({ name: `School ${seed}` })

    const teacherUser = await createUserWithRole('SCHOOL_TEACHER', `${seed}-teacher`, school.id)
    await Teacher.create({ id: teacherUser.id, hourlyRate: 0 })

    const responsibleUser = await createUserWithRole(
      'RESPONSIBLE',
      `${seed}-responsible`,
      school.id
    )
    const studentUser = await createUserWithRole('STUDENT', `${seed}-student`, school.id)
    const student = await Student.create({
      id: studentUser.id,
      balance: 0,
      enrollmentStatus: 'REGISTERED',
    })

    const course = await Course.create({ schoolId: school.id, name: `Course ${seed}` })
    const level = await Level.create({
      schoolId: school.id,
      name: `Level ${seed}`,
      order: 1,
      isActive: true,
    })
    const academicPeriod = await AcademicPeriod.create({
      schoolId: school.id,
      name: `Period ${seed}`,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      isActive: true,
      segment: 'OTHER',
      isClosed: false,
    })
    const coursePeriod = await CourseHasAcademicPeriod.create({
      courseId: course.id,
      academicPeriodId: academicPeriod.id,
    })
    const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
      levelId: level.id,
      courseHasAcademicPeriodId: coursePeriod.id,
      isActive: true,
    })

    const classEntity = await Class_.create({
      name: `Class ${seed}`,
      schoolId: school.id,
      levelId: level.id,
      isArchived: false,
    })

    await StudentHasLevel.create({
      studentId: student.id,
      classId: classEntity.id,
      levelId: level.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const subject = await Subject.create({ schoolId: school.id, name: `Subject ${seed}` })
    await TeacherHasClass.create({
      teacherId: teacherUser.id,
      classId: classEntity.id,
      subjectId: subject.id,
      subjectQuantity: 1,
      isActive: true,
    })

    const inquiry = await ParentInquiry.create({
      studentId: student.id,
      createdByResponsibleId: responsibleUser.id,
      schoolId: school.id,
      subject: `Inquiry ${seed}`,
      status: 'OPEN',
    })

    await ParentInquiryMessage.create({
      inquiryId: inquiry.id,
      authorId: responsibleUser.id,
      authorType: 'RESPONSIBLE',
      body: 'Mensagem inicial',
    })

    const response = await client.get('/api/v1/escola/inquiries').loginAs(teacherUser)

    response.assertStatus(200)
    response.assertBodyContains({ data: [{ id: inquiry.id }] })

    const body = response.body()
    assert.isArray(body.data)
    assert.equal(body.data[0].id, inquiry.id)
  })
})
