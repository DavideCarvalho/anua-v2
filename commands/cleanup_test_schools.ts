import { BaseCommand } from '@adonisjs/core/ace'
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

export default class CleanupTestSchools extends BaseCommand {
  static commandName = 'cleanup:test-schools'
  static description = 'Clean up test schools created during testing'

  async run() {
    this.logger.info('🔍 Finding test schools...')

    const testSchools = await School.query().where('name', 'Test School')

    this.logger.info(`Found ${testSchools.length} test schools`)

    const schoolIds = testSchools.map((s) => s.id)

    if (schoolIds.length === 0) {
      this.logger.success('✅ No test schools to clean up')
      return
    }

    this.logger.info('🧹 Cleaning up related data...')

    // Delete in order respecting foreign keys

    // 1. StudentHasAttendance
    const studentIdsFromSchools = await Student.query().whereIn('schoolId', schoolIds).select('id')

    if (studentIdsFromSchools.length > 0) {
      await StudentHasAttendance.query()
        .whereIn(
          'studentId',
          studentIdsFromSchools.map((s) => s.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted StudentHasAttendance records')
    }

    // 2. StudentHasAcademicPeriod
    const classIds = await Class_.query().whereIn('schoolId', schoolIds).select('id')
    if (classIds.length > 0) {
      await StudentHasAcademicPeriod.query()
        .whereIn(
          'classId',
          classIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted StudentHasAcademicPeriod records')
    }

    // 3. CalendarSlot
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
        this.logger.success('  ✓ Deleted CalendarSlot records')
      }

      // 4. Calendar
      await Calendar.query()
        .whereIn(
          'classId',
          classIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted Calendar records')

      // 5. TeacherHasClass
      await TeacherHasClass.query()
        .whereIn(
          'classId',
          classIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted TeacherHasClass records')

      // 6. StudentHasLevel
      await StudentHasLevel.query()
        .whereIn(
          'classId',
          classIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted StudentHasLevel records')

      // 7. ClassHasAcademicPeriod
      await ClassHasAcademicPeriod.query()
        .whereIn(
          'classId',
          classIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted ClassHasAcademicPeriod records')

      // 8. Class
      await Class_.query().whereIn('schoolId', schoolIds).delete()
      this.logger.success('  ✓ Deleted Class records')
    }

    // 9. ContractPaymentDay
    const contractIds = await Contract.query().whereIn('schoolId', schoolIds).select('id')
    if (contractIds.length > 0) {
      await ContractPaymentDay.query()
        .whereIn(
          'contractId',
          contractIds.map((c) => c.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted ContractPaymentDay records')
    }

    // 10. Contract
    await Contract.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted Contract records')

    // 11. CourseHasAcademicPeriod and LevelAssignedToCourseHasAcademicPeriod
    const academicPeriodIds = await AcademicPeriod.query()
      .whereIn('schoolId', schoolIds)
      .select('id')
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
        this.logger.success('  ✓ Deleted LevelAssignedToCourseHasAcademicPeriod records')
      }

      await CourseHasAcademicPeriod.query()
        .whereIn(
          'academicPeriodId',
          academicPeriodIds.map((a) => a.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted CourseHasAcademicPeriod records')
    }

    // 12. AcademicPeriodHoliday
    if (academicPeriodIds.length > 0) {
      await AcademicPeriodHoliday.query()
        .whereIn(
          'academicPeriodId',
          academicPeriodIds.map((a) => a.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted AcademicPeriodHoliday records')
    }

    // 13. AcademicPeriod
    await AcademicPeriod.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted AcademicPeriod records')

    // 14. Level
    await Level.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted Level records')

    // 15. Subject
    await Subject.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted Subject records')

    // 16. Course
    await Course.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted Course records')

    // 17. CoordinatorHasLevel
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
      this.logger.success('  ✓ Deleted CoordinatorHasLevel records')
    }

    // 18. Student and Teacher
    if (studentIdsFromSchools.length > 0) {
      await Student.query()
        .whereIn(
          'id',
          studentIdsFromSchools.map((s) => s.id)
        )
        .delete()
      this.logger.success('  ✓ Deleted Student records')
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
      this.logger.success('  ✓ Deleted Teacher records')
    }

    // 19. UserHasSchool
    await UserHasSchool.query().whereIn('schoolId', schoolIds).delete()
    this.logger.success('  ✓ Deleted UserHasSchool records')

    // 20. Schools
    await School.query().whereIn('id', schoolIds).delete()
    this.logger.success(`  ✓ Deleted ${testSchools.length} Test School(s)`)

    this.logger.success('✅ Cleanup complete!')
  }
}
