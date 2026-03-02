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
      router.get('/', [ListExtraClassesController]).as('extra_classes.index')
      router.post('/', [CreateExtraClassController]).as('extra_classes.store')
      router.get('/:id', [ShowExtraClassController]).as('extra_classes.show')
      router.put('/:id', [UpdateExtraClassController]).as('extra_classes.update')
      router.delete('/:id', [DeleteExtraClassController]).as('extra_classes.destroy')
      router.post('/:id/enroll', [EnrollExtraClassController]).as('extra_classes.enroll')
      router
        .post('/:id/enroll/:enrollmentId', [CancelExtraClassEnrollmentController])
        .as('extra_classes.enroll.cancel')
      router.get('/:id/students', [ListExtraClassStudentsController]).as('extra_classes.students')
      router
        .post('/:id/attendance', [CreateExtraClassAttendanceController])
        .as('extra_classes.attendance.store')
      router
        .get('/:id/attendance', [ListExtraClassAttendancesController])
        .as('extra_classes.attendance.index')
      router
        .put('/:id/attendance/:attendanceId', [UpdateExtraClassAttendanceController])
        .as('extra_classes.attendance.update')
      router
        .get('/:id/attendance/summary', [GetExtraClassAttendanceSummaryController])
        .as('extra_classes.attendance.summary')
    })
    .prefix('/extra-classes')
    .use([middleware.auth(), middleware.impersonation()])
}
