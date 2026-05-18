import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAttendanceApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.attendance.ListAttendance]).as('attendance.index')
      router.post('/', [controllers.attendance.CreateAttendance]).as('attendance.store')
      router.post('/batch', [controllers.attendance.BatchCreateAttendance]).as('attendance.batch')
      router
        .get('/available-dates', [controllers.attendance.GetAttendanceAvailableDates])
        .as('attendance.available_dates')
      router.get('/lessons', [controllers.attendance.ListLessons]).as('attendance.lessons.index')
      router
        .get('/lessons/:id/students', [controllers.attendance.GetLessonStudents])
        .as('attendance.lessons.students')
      router
        .get('/student/:studentId/history', [controllers.attendance.GetStudentHistory])
        .as('attendance.student.history')
      router
        .get('/class/:classId/students', [controllers.attendance.GetClassStudentsAttendance])
        .as('attendance.class_students')
      router.get('/:id', [controllers.attendance.ShowAttendance]).as('attendance.show')
      router.put('/:id', [controllers.attendance.UpdateAttendance]).as('attendance.update')
      router
        .get('/:id/attachments', [controllers.attendance.ListAttendanceAttachments])
        .as('attendance.attachments.index')
      router
        .post('/:id/attachments', [controllers.attendance.UploadAttendanceAttachment])
        .as('attendance.attachments.upload')
      router
        .delete('/:id/attachments/:attachmentId', [
          controllers.attendance.DeleteAttendanceAttachment,
        ])
        .as('attendance.attachments.delete')
    })
    .prefix('/attendance')
    .use([middleware.auth(), middleware.impersonation(), middleware.canAccessAttendance()])
}
