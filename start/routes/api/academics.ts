import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Courses
const ListCoursesController = () => import('#controllers/courses/list_courses_controller')
const ShowCourseController = () => import('#controllers/courses/show_course_controller')
const CreateCourseController = () => import('#controllers/courses/create_course_controller')
const UpdateCourseController = () => import('#controllers/courses/update_course_controller')
const DeleteCourseController = () => import('#controllers/courses/delete_course_controller')
const GetCourseDashboardMetricsController = () =>
  import('#controllers/courses/get_course_dashboard_metrics_controller')
const GetCourseAlertsController = () => import('#controllers/courses/get_course_alerts_controller')
const GetCourseActivityFeedController = () =>
  import('#controllers/courses/get_course_activity_feed_controller')
const GetCourseClassesController = () =>
  import('#controllers/courses/get_course_classes_controller')

// Levels
const ListLevelsController = () => import('#controllers/levels/list_levels_controller')
const ShowLevelController = () => import('#controllers/levels/show_level_controller')
const CreateLevelController = () => import('#controllers/levels/create_level_controller')
const UpdateLevelController = () => import('#controllers/levels/update_level_controller')
const DeleteLevelController = () => import('#controllers/levels/delete_level_controller')

// Course Has Academic Periods
const CreateCourseHasAcademicPeriodController = () =>
  import('#controllers/course_has_academic_periods/create_course_has_academic_period_controller')

// Level Assignments
const CreateLevelAssignmentController = () =>
  import('#controllers/level_assignments/create_level_assignment_controller')

// Classes
const ListClassesController = () => import('#controllers/classes/list_classes_controller')
const ShowClassController = () => import('#controllers/classes/show_class_controller')
const ShowClassBySlugController = () => import('#controllers/classes/show_class_by_slug_controller')
const CreateClassController = () => import('#controllers/classes/create_class_controller')
const UpdateClassController = () => import('#controllers/classes/update_class_controller')
const DeleteClassController = () => import('#controllers/classes/delete_class_controller')
const UpdateClassWithTeachersController = () =>
  import('#controllers/classes/update_class_with_teachers_controller')
const CreateClassWithTeachersController = () =>
  import('#controllers/classes/create_class_with_teachers_controller')
const ListClassStudentsController = () =>
  import('#controllers/classes/list_class_students_controller')
const CountClassStudentsController = () =>
  import('#controllers/classes/count_class_students_controller')
const GetClassesForSidebarController = () =>
  import('#controllers/classes/get_classes_for_sidebar_controller')
const GetStudentStatusController = () =>
  import('#controllers/students/get_student_status_controller')

// Subjects
const ListSubjectsController = () => import('#controllers/subjects/list_subjects_controller')
const ShowSubjectController = () => import('#controllers/subjects/show_subject_controller')
const ShowSubjectBySlugController = () =>
  import('#controllers/subjects/show_subject_by_slug_controller')
const CreateSubjectController = () => import('#controllers/subjects/create_subject_controller')
const UpdateSubjectController = () => import('#controllers/subjects/update_subject_controller')
const DeleteSubjectController = () => import('#controllers/subjects/delete_subject_controller')
const ListSubjectsForClassController = () =>
  import('#controllers/subjects/list_subjects_for_class_controller')

// Schedules
const GetClassScheduleController = () =>
  import('#controllers/schedules/get_class_schedule_controller')
const SaveClassScheduleController = () =>
  import('#controllers/schedules/save_class_schedule_controller')
const GenerateClassScheduleController = () =>
  import('#controllers/schedules/generate_class_schedule_controller')
const ValidateTeacherScheduleConflictController = () =>
  import('#controllers/schedules/validate_teacher_schedule_conflict_controller')

// Teachers
const ListTeachersController = () => import('#controllers/teachers/list_teachers_controller')
const ShowTeacherController = () => import('#controllers/teachers/show_teacher_controller')
const CreateTeacherController = () => import('#controllers/teachers/create_teacher_controller')
const UpdateTeacherController = () => import('#controllers/teachers/update_teacher_controller')
const DeleteTeacherController = () => import('#controllers/teachers/delete_teacher_controller')
const ListTeacherClassesController = () =>
  import('#controllers/teachers/list_teacher_classes_controller')
const ListTeacherSubjectsController = () =>
  import('#controllers/teachers/list_teacher_subjects_controller')
const UpdateTeacherSubjectsController = () =>
  import('#controllers/teachers/update_teacher_subjects_controller')
const AssignTeacherToClassController = () =>
  import('#controllers/teachers/assign_teacher_to_class_controller')
const RemoveTeacherFromClassController = () =>
  import('#controllers/teachers/remove_teacher_from_class_controller')

// Exams
const ListExamsController = () => import('#controllers/exams/list_exams_controller')
const ShowExamController = () => import('#controllers/exams/show_exam_controller')
const CreateExamController = () => import('#controllers/exams/create_exam_controller')
const UpdateExamController = () => import('#controllers/exams/update_exam_controller')
const DeleteExamController = () => import('#controllers/exams/delete_exam_controller')
const ListExamGradesController = () => import('#controllers/exams/list_exam_grades_controller')
const SaveExamGradeController = () => import('#controllers/exams/save_exam_grade_controller')
const BatchSaveExamGradesController = () =>
  import('#controllers/exams/batch_save_exam_grades_controller')
const UpdateExamGradeController = () => import('#controllers/exams/update_exam_grade_controller')

// Grades Analytics
const GetAcademicOverviewController = () =>
  import('#controllers/grades/get_academic_overview_controller')
const GetStudentsGradesController = () =>
  import('#controllers/grades/get_students_grades_controller')
const GetGradeDistributionController = () =>
  import('#controllers/grades/get_grade_distribution_controller')
const GetAtRiskStudentsController = () =>
  import('#controllers/grades/get_at_risk_students_controller')
const GetClassGradesBySubjectController = () =>
  import('#controllers/grades/get_class_grades_by_subject_controller')
const BatchSaveGradesController = () => import('#controllers/grades/batch_save_grades_controller')

// Academic Periods
const ListAcademicPeriodsController = () =>
  import('#controllers/academic_periods/list_academic_periods_controller')
const GetCurrentActiveAcademicPeriodsController = () =>
  import('#controllers/academic_periods/get_current_active_academic_periods_controller')
const CreateAcademicPeriodController = () =>
  import('#controllers/academic_periods/create_academic_period_controller')
const ShowAcademicPeriodController = () =>
  import('#controllers/academic_periods/show_academic_period_controller')
const ShowAcademicPeriodBySlugController = () =>
  import('#controllers/academic_periods/show_academic_period_by_slug_controller')
const UpdateAcademicPeriodController = () =>
  import('#controllers/academic_periods/update_academic_period_controller')
const DeleteAcademicPeriodController = () =>
  import('#controllers/academic_periods/delete_academic_period_controller')
const ListAcademicPeriodCoursesController = () =>
  import('#controllers/academic_periods/list_academic_period_courses_controller')
const UpdateAcademicPeriodCoursesController = () =>
  import('#controllers/academic_periods/update_academic_period_courses_controller')

export function registerCourseApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListCoursesController]).as('courses.index')
      router.post('/', [CreateCourseController]).as('courses.store')
      router.get('/:id', [ShowCourseController]).as('courses.show')
      router.put('/:id', [UpdateCourseController]).as('courses.update')
      router.delete('/:id', [DeleteCourseController]).as('courses.destroy')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/metrics', [
          GetCourseDashboardMetricsController,
        ])
        .as('courses.dashboard.metrics')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/alerts', [
          GetCourseAlertsController,
        ])
        .as('courses.dashboard.alerts')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/dashboard/activity-feed', [
          GetCourseActivityFeedController,
        ])
        .as('courses.dashboard.activityFeed')
      router
        .get('/:courseId/academic-periods/:academicPeriodId/classes', [GetCourseClassesController])
        .as('courses.classes')
    })
    .prefix('/courses')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerLevelApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListLevelsController]).as('levels.index')
      router.post('/', [CreateLevelController]).as('levels.store')
      router.get('/:id', [ShowLevelController]).as('levels.show')
      router.put('/:id', [UpdateLevelController]).as('levels.update')
      router.delete('/:id', [DeleteLevelController]).as('levels.destroy')
    })
    .prefix('/levels')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCourseHasAcademicPeriodApiRoutes() {
  router
    .group(() => {
      router
        .post('/', [CreateCourseHasAcademicPeriodController])
        .as('courseHasAcademicPeriods.store')
    })
    .prefix('/course-has-academic-periods')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerLevelAssignmentApiRoutes() {
  router
    .group(() => {
      router.post('/', [CreateLevelAssignmentController]).as('levelAssignments.store')
    })
    .prefix('/level-assignments')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerClassApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListClassesController]).as('classes.index')
      router.post('/', [CreateClassController]).as('classes.store')
      router
        .post('/with-teachers', [CreateClassWithTeachersController])
        .as('classes.storeWithTeachers')
      router.get('/slug/:slug', [ShowClassBySlugController]).as('classes.showBySlug')
      router.get('/sidebar', [GetClassesForSidebarController]).as('classes.sidebar')
      router.get('/:id', [ShowClassController]).as('classes.show')
      router.put('/:id', [UpdateClassController]).as('classes.update')
      router.delete('/:id', [DeleteClassController]).as('classes.destroy')
      router
        .put('/:id/teachers', [UpdateClassWithTeachersController])
        .as('classes.updateWithTeachers')
      router.get('/:id/students', [ListClassStudentsController]).as('classes.students')
      router.get('/:id/students/count', [CountClassStudentsController]).as('classes.studentsCount')
      router.get('/:id/student-status', [GetStudentStatusController]).as('classes.studentStatus')
      router.get('/:classId/subjects', [ListSubjectsForClassController]).as('classes.subjects')
    })
    .prefix('/classes')
    .use([middleware.auth(), middleware.impersonation(), middleware.escolaTeacherClasses()])
}

export function registerSubjectApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubjectsController]).as('subjects.index')
      router.post('/', [CreateSubjectController]).as('subjects.store')
      router.get('/slug/:slug', [ShowSubjectBySlugController]).as('subjects.showBySlug')
      router.get('/:id', [ShowSubjectController]).as('subjects.show')
      router.put('/:id', [UpdateSubjectController]).as('subjects.update')
      router.delete('/:id', [DeleteSubjectController]).as('subjects.destroy')
    })
    .prefix('/subjects')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerScheduleApiRoutes() {
  router
    .group(() => {
      router.get('/class/:classId', [GetClassScheduleController]).as('schedules.getClassSchedule')
      router
        .post('/class/:classId', [SaveClassScheduleController])
        .as('schedules.saveClassSchedule')
      router
        .post('/class/:classId/generate', [GenerateClassScheduleController])
        .as('schedules.generateClassSchedule')
      router
        .post('/validate-conflict', [ValidateTeacherScheduleConflictController])
        .as('schedules.validateConflict')
    })
    .prefix('/schedules')
    .use(middleware.auth())
}

export function registerTeacherApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListTeachersController]).as('teachers.listTeachers')
      router.post('/', [CreateTeacherController]).as('teachers.createTeacher')

      // Rotas especificas ANTES das rotas com parametros /:id
      router
        .get('/timesheet', [
          () => import('#controllers/teachers/get_teachers_timesheet_controller'),
          'handle',
        ])
        .as('teachers.getTeachersTimesheet')
      router
        .get('/absences', [
          () => import('#controllers/teachers/get_teacher_absences_controller'),
          'handle',
        ])
        .as('teachers.getTeacherAbsences')
      router
        .patch('/absences/approve', [
          () => import('#controllers/teachers/approve_absence_controller'),
          'handle',
        ])
        .as('teachers.approveAbsence')
      router
        .patch('/absences/reject', [
          () => import('#controllers/teachers/reject_absence_controller'),
          'handle',
        ])
        .as('teachers.rejectAbsence')

      // Rotas com parametros /:id
      router.get('/:id', [ShowTeacherController]).as('teachers.showTeacher')
      router.put('/:id', [UpdateTeacherController]).as('teachers.updateTeacher')
      router.delete('/:id', [DeleteTeacherController]).as('teachers.deleteTeacher')
      router.get('/:id/classes', [ListTeacherClassesController]).as('teachers.listTeacherClasses')
      router
        .get('/:id/subjects', [ListTeacherSubjectsController])
        .as('teachers.listTeacherSubjects')
      router
        .put('/:id/subjects', [UpdateTeacherSubjectsController])
        .as('teachers.updateTeacherSubjects')
      router.post('/:id/classes', [AssignTeacherToClassController]).as('teachers.assignClass')
      router
        .delete('/:id/classes/:classId', [RemoveTeacherFromClassController])
        .as('teachers.removeClass')
    })
    .prefix('/teachers')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerExamApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListExamsController]).as('exams.index')
      router.post('/', [CreateExamController]).as('exams.store')
      router.get('/:id', [ShowExamController]).as('exams.show')
      router.put('/:id', [UpdateExamController]).as('exams.update')
      router.delete('/:id', [DeleteExamController]).as('exams.destroy')
      router.post('/:id/grades/batch', [BatchSaveExamGradesController]).as('exams.batchSaveGrades')
      router.get('/:id/grades', [ListExamGradesController]).as('exams.grades')
      router.post('/:id/grades', [SaveExamGradeController]).as('exams.grades.store')
      router.put('/:id/grades/:gradeId', [UpdateExamGradeController]).as('exams.updateGrade')
    })
    .prefix('/exams')
    .use(middleware.auth())
}

export function registerGradesApiRoutes() {
  router
    .group(() => {
      router
        .get('/academic-overview', [GetAcademicOverviewController])
        .as('grades.academicOverview')
      router.get('/students', [GetStudentsGradesController]).as('grades.students')
      router.get('/distribution', [GetGradeDistributionController]).as('grades.distribution')
      router.get('/at-risk', [GetAtRiskStudentsController]).as('grades.atRisk')
      router
        .get('/class/:classId/subject/:subjectId', [GetClassGradesBySubjectController])
        .as('grades.classSubject')
      router.post('/batch', [BatchSaveGradesController]).as('grades.batchSave')
    })
    .prefix('/grades')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerAcademicPeriodApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAcademicPeriodsController]).as('academicPeriods.listAcademicPeriods')
      router
        .get('/current-active', [GetCurrentActiveAcademicPeriodsController])
        .as('academicPeriods.getCurrentActiveAcademicPeriods')
      router
        .get('/by-slug/:slug', [ShowAcademicPeriodBySlugController])
        .as('academicPeriods.showBySlug')
      router.post('/', [CreateAcademicPeriodController]).as('academicPeriods.createAcademicPeriod')
      router.get('/:id', [ShowAcademicPeriodController]).as('academicPeriods.showAcademicPeriod')
      router
        .put('/:id', [UpdateAcademicPeriodController])
        .as('academicPeriods.updateAcademicPeriod')
      router
        .delete('/:id', [DeleteAcademicPeriodController])
        .as('academicPeriods.deleteAcademicPeriod')
      router
        .get('/:id/courses', [ListAcademicPeriodCoursesController])
        .as('academicPeriods.listCourses')
      router
        .put('/:id/courses', [UpdateAcademicPeriodCoursesController])
        .as('academicPeriods.updateCourses')
    })
    .prefix('/academic-periods')
    .use([middleware.auth(), middleware.impersonation()])
}
