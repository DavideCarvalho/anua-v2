import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerCourseApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.courses.ListCourses]).as('courses.index')
      router.post('/', [controllers.courses.CreateCourse]).as('courses.store')
      router.get('/:id', [controllers.courses.ShowCourse]).as('courses.show')
      router.put('/:id', [controllers.courses.UpdateCourse]).as('courses.update')
      router.delete('/:id', [controllers.courses.DeleteCourse]).as('courses.destroy')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/metrics', [
          controllers.courses.GetCourseDashboardMetrics,
        ])
        .as('courses.dashboard.metrics')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/alerts', [
          controllers.courses.GetCourseAlerts,
        ])
        .as('courses.dashboard.alerts')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/activity-feed', [
          controllers.courses.GetCourseActivityFeed,
        ])
        .as('courses.dashboard.activity_feed')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/classes', [
          controllers.courses.GetCourseClasses,
        ])
        .as('courses.classes')
    })
    .prefix('/courses')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerLevelApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.levels.ListLevels]).as('levels.index')
      router.post('/', [controllers.levels.CreateLevel]).as('levels.store')
      router.get('/:id', [controllers.levels.ShowLevel]).as('levels.show')
      router.put('/:id', [controllers.levels.UpdateLevel]).as('levels.update')
      router.delete('/:id', [controllers.levels.DeleteLevel]).as('levels.destroy')
    })
    .prefix('/levels')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCourseHasAcademicPeriodApiRoutes() {
  router
    .group(() => {
      router
        .post('/', [controllers.courseHasAcademicPeriods.CreateCourseHasAcademicPeriod])
        .as('course_has_academic_periods.store')
    })
    .prefix('/course-has-academic-periods')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerLevelAssignmentApiRoutes() {
  router
    .group(() => {
      router
        .post('/', [controllers.levelAssignments.CreateLevelAssignment])
        .as('level_assignments.store')
    })
    .prefix('/level-assignments')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerClassApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.classes.ListClasses]).as('classes.index')
      router.post('/', [controllers.classes.CreateClass]).as('classes.store')
      router
        .post('/with-teachers', [controllers.classes.CreateClassWithTeachers])
        .as('classes.store_with_teachers')
      router.get('/slug/:slug', [controllers.classes.ShowClassBySlug]).as('classes.show_by_slug')
      router.get('/sidebar', [controllers.classes.GetClassesForSidebar]).as('classes.sidebar')
      router.get('/:id', [controllers.classes.ShowClass]).as('classes.show')
      router.put('/:id', [controllers.classes.UpdateClass]).as('classes.update')
      router.delete('/:id', [controllers.classes.DeleteClass]).as('classes.destroy')
      router
        .put('/:id/teachers', [controllers.classes.UpdateClassWithTeachers])
        .as('classes.update_with_teachers')
      router.get('/:id/students', [controllers.classes.ListClassStudents]).as('classes.students')
      router
        .get('/:id/students/count', [controllers.classes.CountClassStudents])
        .as('classes.students_count')
      router
        .get('/:id/student-status', [controllers.students.GetStudentStatus])
        .as('classes.student_status')
      router
        .get('/:classId/subjects', [controllers.subjects.ListSubjectsForClass])
        .as('classes.subjects')
    })
    .prefix('/classes')
    .use([middleware.auth(), middleware.impersonation(), middleware.escolaTeacherClasses()])
}

export function registerSubjectApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.subjects.ListSubjects]).as('subjects.index')
      router.post('/', [controllers.subjects.CreateSubject]).as('subjects.store')
      router
        .get('/slug/:slug', [controllers.subjects.ShowSubjectBySlug])
        .as('subjects.show_by_slug')
      router.get('/:id', [controllers.subjects.ShowSubject]).as('subjects.show')
      router.put('/:id', [controllers.subjects.UpdateSubject]).as('subjects.update')
      router.delete('/:id', [controllers.subjects.DeleteSubject]).as('subjects.destroy')
    })
    .prefix('/subjects')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerScheduleApiRoutes() {
  router
    .group(() => {
      router
        .get('/class/:classId', [controllers.schedules.GetClassSchedule])
        .as('schedules.get_class_schedule')
      router
        .post('/class/:classId', [controllers.schedules.SaveClassSchedule])
        .as('schedules.save_class_schedule')
      router
        .post('/class/:classId/generate', [controllers.schedules.GenerateClassSchedule])
        .as('schedules.generate_class_schedule')
      router
        .post('/validate-conflict', [controllers.schedules.ValidateTeacherScheduleConflict])
        .as('schedules.validate_conflict')
    })
    .prefix('/schedules')
    .use(middleware.auth())
}

export function registerTeacherApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.teachers.ListTeachers]).as('teachers.list_teachers')
      router.post('/', [controllers.teachers.CreateTeacher]).as('teachers.create_teacher')

      // Rotas especificas ANTES das rotas com parametros /:id
      router
        .get('/timesheet', [controllers.teachers.GetTeachersTimesheet])
        .as('teachers.get_teachers_timesheet')
      router
        .get('/absences', [controllers.teachers.GetTeacherAbsences])
        .as('teachers.get_teacher_absences')
      router
        .patch('/absences/approve', [controllers.teachers.ApproveAbsence])
        .as('teachers.approve_absence')
      router
        .patch('/absences/reject', [controllers.teachers.RejectAbsence])
        .as('teachers.reject_absence')

      // Rotas com parametros /:id
      router.get('/:id', [controllers.teachers.ShowTeacher]).as('teachers.show_teacher')
      router.put('/:id', [controllers.teachers.UpdateTeacher]).as('teachers.update_teacher')
      router.delete('/:id', [controllers.teachers.DeleteTeacher]).as('teachers.delete_teacher')
      router
        .get('/:id/classes', [controllers.teachers.ListTeacherClasses])
        .as('teachers.list_teacher_classes')
      router
        .get('/:id/subjects', [controllers.teachers.ListTeacherSubjects])
        .as('teachers.list_teacher_subjects')
      router
        .put('/:id/subjects', [controllers.teachers.UpdateTeacherSubjects])
        .as('teachers.update_teacher_subjects')
      router
        .post('/:id/classes', [controllers.teachers.AssignTeacherToClass])
        .as('teachers.assign_class')
      router
        .delete('/:id/classes/:classId', [controllers.teachers.RemoveTeacherFromClass])
        .as('teachers.remove_class')
    })
    .prefix('/teachers')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerExamApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.exams.ListExams]).as('exams.index')
      router.post('/', [controllers.exams.CreateExam]).as('exams.store')
      router.get('/:id', [controllers.exams.ShowExam]).as('exams.show')
      router.get('/:id/history', [controllers.exams.ListExamHistory]).as('exams.history')
      router.put('/:id', [controllers.exams.UpdateExam]).as('exams.update')
      router.delete('/:id', [controllers.exams.DeleteExam]).as('exams.destroy')
      router
        .post('/:id/grades/batch', [controllers.exams.BatchSaveExamGrades])
        .as('exams.batch_save_grades')
      router.get('/:id/grades', [controllers.exams.ListExamGrades]).as('exams.grades')
      router.post('/:id/grades', [controllers.exams.SaveExamGrade]).as('exams.grades.store')
      router
        .put('/:id/grades/:gradeId', [controllers.exams.UpdateExamGrade])
        .as('exams.update_grade')
    })
    .prefix('/exams')
    .use(middleware.auth())
}

export function registerGradesApiRoutes() {
  router
    .group(() => {
      router
        .get('/academic-overview', [controllers.grades.GetAcademicOverview])
        .as('grades.academic_overview')
      router.get('/students', [controllers.grades.GetStudentsGrades]).as('grades.students')
      router
        .get('/distribution', [controllers.grades.GetGradeDistribution])
        .as('grades.distribution')
      router.get('/at-risk', [controllers.grades.GetAtRiskStudents]).as('grades.at_risk')
      router.get('/trends', [controllers.grades.GetGradeTrends]).as('grades.trends')
      router
        .get('/class/:classId/subject/:subjectId', [controllers.grades.GetClassGradesBySubject])
        .as('grades.class_subject')
      router.post('/batch', [controllers.grades.BatchSaveGrades]).as('grades.batch_save')
    })
    .prefix('/grades')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAcademicPeriodApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.academicPeriods.ListAcademicPeriods])
        .as('academic_periods.list_academic_periods')
      router
        .get('/current-active', [controllers.academicPeriods.GetCurrentActiveAcademicPeriods])
        .as('academic_periods.get_current_active_academic_periods')
      router
        .get('/by-slug/:slug', [controllers.academicPeriods.ShowAcademicPeriodBySlug])
        .as('academic_periods.show_by_slug')
      router
        .get('/by-slug/:slug/dashboard', [
          controllers.academicPeriods.ShowAcademicPeriodDashboardBySlug,
        ])
        .as('academic_periods.show_dashboard_by_slug')
      router
        .post('/', [controllers.academicPeriods.CreateAcademicPeriod])
        .as('academic_periods.create_academic_period')
      router
        .get('/:id', [controllers.academicPeriods.ShowAcademicPeriod])
        .as('academic_periods.show_academic_period')
      router
        .put('/:id', [controllers.academicPeriods.UpdateAcademicPeriod])
        .as('academic_periods.update_academic_period')
      router
        .delete('/:id', [controllers.academicPeriods.DeleteAcademicPeriod])
        .as('academic_periods.delete_academic_period')
      router
        .get('/:id/courses', [controllers.academicPeriods.ListAcademicPeriodCourses])
        .as('academic_periods.list_courses')
      router
        .put('/:id/courses', [controllers.academicPeriods.UpdateAcademicPeriodCourses])
        .as('academic_periods.update_courses')
    })
    .prefix('/academic-periods')
    .use([middleware.auth(), middleware.impersonation()])
}
