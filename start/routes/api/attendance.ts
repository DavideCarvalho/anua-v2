import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Attendance
const ListAttendanceController = () => import('#controllers/attendance/list_attendance_controller')
const ShowAttendanceController = () => import('#controllers/attendance/show_attendance_controller')
const CreateAttendanceController = () =>
  import('#controllers/attendance/create_attendance_controller')
const BatchCreateAttendanceController = () =>
  import('#controllers/attendance/batch_create_attendance_controller')
const GetAttendanceAvailableDatesController = () =>
  import('#controllers/attendance/get_attendance_available_dates_controller')
const UpdateAttendanceController = () =>
  import('#controllers/attendance/update_attendance_controller')
const GetClassStudentsAttendanceController = () =>
  import('#controllers/attendance/get_class_students_attendance_controller')

export function registerAttendanceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAttendanceController]).as('attendance.index')
      router.post('/', [CreateAttendanceController]).as('attendance.store')
      router.post('/batch', [BatchCreateAttendanceController]).as('attendance.batch')
      router
        .get('/available-dates', [GetAttendanceAvailableDatesController])
        .as('attendance.availableDates')
      router.get('/:id', [ShowAttendanceController]).as('attendance.show')
      router.put('/:id', [UpdateAttendanceController]).as('attendance.update')
      router
        .get('/class/:classId/students', [GetClassStudentsAttendanceController])
        .as('attendance.classStudents')
    })
    .prefix('/attendance')
    .use([middleware.auth(), middleware.impersonation()])
}
