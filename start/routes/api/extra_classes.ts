import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerExtraClassApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.extraClasses.ListExtraClasses]).as('extra_classes.index')
      router.post('/', [controllers.extraClasses.CreateExtraClass]).as('extra_classes.store')
      router.get('/:id', [controllers.extraClasses.ShowExtraClass]).as('extra_classes.show')
      router.put('/:id', [controllers.extraClasses.UpdateExtraClass]).as('extra_classes.update')
      router.delete('/:id', [controllers.extraClasses.DeleteExtraClass]).as('extra_classes.destroy')
      router
        .post('/:id/enroll', [controllers.extraClasses.EnrollExtraClass])
        .as('extra_classes.enroll')
      router
        .post('/:id/enroll/:enrollmentId', [controllers.extraClasses.CancelExtraClassEnrollment])
        .as('extra_classes.enroll.cancel')
      router
        .get('/:id/students', [controllers.extraClasses.ListExtraClassStudents])
        .as('extra_classes.students')
      router
        .post('/:id/attendance', [controllers.extraClasses.CreateExtraClassAttendance])
        .as('extra_classes.attendance.store')
      router
        .get('/:id/attendance', [controllers.extraClasses.ListExtraClassAttendances])
        .as('extra_classes.attendance.index')
      router
        .put('/:id/attendance/:attendanceId', [controllers.extraClasses.UpdateExtraClassAttendance])
        .as('extra_classes.attendance.update')
      router
        .get('/:id/attendance/summary', [controllers.extraClasses.GetExtraClassAttendanceSummary])
        .as('extra_classes.attendance.summary')
    })
    .prefix('/extra-classes')
    .use([middleware.auth(), middleware.impersonation()])
}
