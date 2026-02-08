import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Extra Classes
const ListExtraClassesController = () =>
  import('#controllers/extra_classes/list_extra_classes_controller')
const CreateExtraClassController = () =>
  import('#controllers/extra_classes/create_extra_class_controller')
const ShowExtraClassController = () =>
  import('#controllers/extra_classes/show_extra_class_controller')
const UpdateExtraClassController = () =>
  import('#controllers/extra_classes/update_extra_class_controller')
const DeleteExtraClassController = () =>
  import('#controllers/extra_classes/delete_extra_class_controller')
const EnrollExtraClassController = () =>
  import('#controllers/extra_classes/enroll_extra_class_controller')
const CancelExtraClassEnrollmentController = () =>
  import('#controllers/extra_classes/cancel_extra_class_enrollment_controller')
const ListExtraClassStudentsController = () =>
  import('#controllers/extra_classes/list_extra_class_students_controller')
const CreateExtraClassAttendanceController = () =>
  import('#controllers/extra_classes/create_extra_class_attendance_controller')
const ListExtraClassAttendancesController = () =>
  import('#controllers/extra_classes/list_extra_class_attendances_controller')
const UpdateExtraClassAttendanceController = () =>
  import('#controllers/extra_classes/update_extra_class_attendance_controller')
const GetExtraClassAttendanceSummaryController = () =>
  import('#controllers/extra_classes/get_extra_class_attendance_summary_controller')

export function registerExtraClassApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListExtraClassesController]).as('extraClasses.index')
      router.post('/', [CreateExtraClassController]).as('extraClasses.store')
      router.get('/:id', [ShowExtraClassController]).as('extraClasses.show')
      router.put('/:id', [UpdateExtraClassController]).as('extraClasses.update')
      router.delete('/:id', [DeleteExtraClassController]).as('extraClasses.destroy')
      router.post('/:id/enroll', [EnrollExtraClassController]).as('extraClasses.enroll')
      router
        .post('/:id/enroll/:enrollmentId', [CancelExtraClassEnrollmentController])
        .as('extraClasses.enroll.cancel')
      router.get('/:id/students', [ListExtraClassStudentsController]).as('extraClasses.students')
      router
        .post('/:id/attendance', [CreateExtraClassAttendanceController])
        .as('extraClasses.attendance.store')
      router
        .get('/:id/attendance', [ListExtraClassAttendancesController])
        .as('extraClasses.attendance.index')
      router
        .put('/:id/attendance/:attendanceId', [UpdateExtraClassAttendanceController])
        .as('extraClasses.attendance.update')
      router
        .get('/:id/attendance/summary', [GetExtraClassAttendanceSummaryController])
        .as('extraClasses.attendance.summary')
    })
    .prefix('/extra-classes')
    .use([middleware.auth(), middleware.impersonation()])
}
