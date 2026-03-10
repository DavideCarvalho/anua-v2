import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import Student from '#models/student'
import Teacher from '#models/teacher'
import Class_ from '#models/class'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import Level from '#models/level'
import Subject from '#models/subject'
import Contract from '#models/contract'
import Calendar from '#models/calendar'
import StudentHasLevel from '#models/student_has_level'
import TeacherHasClass from '#models/teacher_has_class'
import CalendarSlot from '#models/calendar_slot'
import StudentHasAttendance from '#models/student_has_attendance'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import AcademicPeriodHoliday from '#models/academic_period_holiday'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import ContractPaymentDay from '#models/contract_payment_day'
import StudentHasAcademicPeriod from '#models/student_has_academic_period'

async function cleanupTestSchools() {
  console.log('🔍 Finding test schools...')

  const testSchools = await School.query().where('name', 'Test School')

  console.log(`Found ${testSchools.length} test schools`)

  const schoolIds = testSchools.map((s) => s.id)

  if (schoolIds.length === 0) {
    console.log('✅ No test schools to clean up')
    return
  }

  console.log('🧹 Cleaning up related data...')

  // Delete in order respecting foreign keys

  // 1. StudentHasAttendance (students from these schools)
  const studentIdsFromSchools = await Student.query().whereIn('schoolId', schoolIds).select('id')

  if (studentIdsFromSchools.length > 0) {
    await StudentHasAttendance.query()
      .whereIn(
        'studentId',
        studentIdsFromSchools.map((s) => s.id)
      )
      .delete()
    console.log(`  ✓ Deleted StudentHasAttendance records`)
  }

  // 2. StudentHasAcademicPeriod
  await StudentHasAcademicPeriod.query()
    .whereIn('classId', await Class.query().whereIn('schoolId', schoolIds).select('id'))
    .delete()
  console.log(`  ✓ Deleted StudentHasAcademicPeriod records`)

  // 3. CalendarSlot (via Calendar -> Class)
  const classIds = await Class.query().whereIn('schoolId', schoolIds).select('id')
  if (classIds.length > 0) {
    const calendarIds = await Calendar.query()
      .whereIn(
        'classId',
        classIds.map((c) => c.id)
      )
      .select('id')
    if (calendarIds.length > 0) {
      await CalendarSlot.query()
        .whereIn(
          'calendarId',
          calendarIds.map((c) => c.id)
        )
        .delete()
      console.log(`  ✓ Deleted CalendarSlot records`)
    }
  }

  // 4. Calendar
  await Calendar.query()
    .whereIn(
      'classId',
      classIds.map((c) => c.id)
    )
    .delete()
  console.log(`  ✓ Deleted Calendar records`)

  // 5. TeacherHasClass
  await TeacherHasClass.query()
    .whereIn(
      'classId',
      classIds.map((c) => c.id)
    )
    .delete()
  console.log(`  ✓ Deleted TeacherHasClass records`)

  // 6. StudentHasLevel
  await StudentHasLevel.query()
    .whereIn(
      'classId',
      classIds.map((c) => c.id)
    )
    .delete()
  console.log(`  ✓ Deleted StudentHasLevel records`)

  // 7. ClassHasAcademicPeriod
  await ClassHasAcademicPeriod.query()
    .whereIn(
      'classId',
      classIds.map((c) => c.id)
    )
    .delete()
  console.log(`  ✓ Deleted ClassHasAcademicPeriod records`)

  // 8. Class
  await Class.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted Class records`)

  // 9. ContractPaymentDay (via Contract)
  const contractIds = await Contract.query().whereIn('schoolId', schoolIds).select('id')
  if (contractIds.length > 0) {
    await ContractPaymentDay.query()
      .whereIn(
        'contractId',
        contractIds.map((c) => c.id)
      )
      .delete()
    console.log(`  ✓ Deleted ContractPaymentDay records`)
  }

  // 10. Contract
  await Contract.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted Contract records`)

  // 11. CourseHasAcademicPeriod and LevelAssignedToCourseHasAcademicPeriod
  const academicPeriodIds = await AcademicPeriod.query().whereIn('schoolId', schoolIds).select('id')
  if (academicPeriodIds.length > 0) {
    const courseHasPeriodIds = await CourseHasAcademicPeriod.query()
      .whereIn(
        'academicPeriodId',
        academicPeriodIds.map((a) => a.id)
      )
      .select('id')

    if (courseHasPeriodIds.length > 0) {
      await LevelAssignedToCourseHasAcademicPeriod.query()
        .whereIn(
          'courseHasAcademicPeriodId',
          courseHasPeriodIds.map((c) => c.id)
        )
        .delete()
      console.log(`  ✓ Deleted LevelAssignedToCourseHasAcademicPeriod records`)
    }

    await CourseHasAcademicPeriod.query()
      .whereIn(
        'academicPeriodId',
        academicPeriodIds.map((a) => a.id)
      )
      .delete()
    console.log(`  ✓ Deleted CourseHasAcademicPeriod records`)
  }

  // 12. AcademicPeriodHoliday
  await AcademicPeriodHoliday.query()
    .whereIn(
      'academicPeriodId',
      academicPeriodIds.map((a) => a.id)
    )
    .delete()
  console.log(`  ✓ Deleted AcademicPeriodHoliday records`)

  // 13. AcademicPeriod
  await AcademicPeriod.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted AcademicPeriod records`)

  // 14. Level
  await Level.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted Level records`)

  // 15. Subject
  await Subject.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted Subject records`)

  // 16. Course
  await Course.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted Course records`)

  // 17. CoordinatorHasLevel (coordinators from these schools)
  const userIdsFromSchools = await UserHasSchool.query()
    .whereIn('schoolId', schoolIds)
    .select('userId')

  if (userIdsFromSchools.length > 0) {
    await CoordinatorHasLevel.query()
      .whereIn(
        'coordinatorId',
        userIdsFromSchools.map((u) => u.userId)
      )
      .delete()
    console.log(`  ✓ Deleted CoordinatorHasLevel records`)
  }

  // 18. Student and Teacher records
  if (studentIdsFromSchools.length > 0) {
    await Student.query()
      .whereIn(
        'id',
        studentIdsFromSchools.map((s) => s.id)
      )
      .delete()
    console.log(`  ✓ Deleted Student records`)
  }

  const teacherIdsFromSchools = await Teacher.query()
    .whereIn(
      'id',
      userIdsFromSchools.map((u) => u.userId)
    )
    .select('id')

  if (teacherIdsFromSchools.length > 0) {
    await Teacher.query()
      .whereIn(
        'id',
        teacherIdsFromSchools.map((t) => t.id)
      )
      .delete()
    console.log(`  ✓ Deleted Teacher records`)
  }

  // 19. UserHasSchool
  await UserHasSchool.query().whereIn('schoolId', schoolIds).delete()
  console.log(`  ✓ Deleted UserHasSchool records`)

  // 20. Users (optional - only test users)
  // Commented out to avoid deleting potentially important users
  // await User.query()
  //   .whereIn('id', userIdsFromSchools.map(u => u.userId))
  //   .where('email', 'like', '%test%')
  //   .delete()

  // 21. Finally, delete the schools
  await School.query().whereIn('id', schoolIds).delete()
  console.log(`  ✓ Deleted ${testSchools.length} Test School(s)`)

  console.log('✅ Cleanup complete!')
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  cleanupTestSchools()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error during cleanup:', error)
      process.exit(1)
    })
}

export { cleanupTestSchools }
