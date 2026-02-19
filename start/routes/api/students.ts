import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Students
const IndexStudentsController = () => import('#controllers/students/index')
const ShowStudentController = () => import('#controllers/students/show')
const StoreStudentController = () => import('#controllers/students/store')
const UpdateStudentController = () => import('#controllers/students/update')
const DestroyStudentController = () => import('#controllers/students/destroy')
const EnrollStudentController = () => import('#controllers/students/enroll_student_controller')
const FullUpdateStudentController = () =>
  import('#controllers/students/full_update_student_controller')
const ListStudentEnrollmentsController = () =>
  import('#controllers/students/list_enrollments_controller')
const UpdateEnrollmentController = () =>
  import('#controllers/students/update_enrollment_controller')
const CancelEnrollmentController = () =>
  import('#controllers/students/cancel_enrollment_controller')
const CheckDocumentController = () => import('#controllers/students/check_document_controller')
const CheckEmailController = () => import('#controllers/students/check_email_controller')
const LookupResponsibleController = () =>
  import('#controllers/students/lookup_responsible_controller')

// Responsibles
const ListStudentResponsiblesController = () =>
  import('#controllers/responsibles/list_student_responsibles_controller')
const AssignResponsibleController = () =>
  import('#controllers/responsibles/assign_responsible_controller')
const UpdateResponsibleAssignmentController = () =>
  import('#controllers/responsibles/update_responsible_assignment_controller')
const RemoveResponsibleController = () =>
  import('#controllers/responsibles/remove_responsible_controller')

// Responsible Addresses
const ShowResponsibleAddressController = () =>
  import('#controllers/responsible-addresses/show_responsible_address_controller')
const CreateResponsibleAddressController = () =>
  import('#controllers/responsible-addresses/create_responsible_address_controller')

// Student Payments/Balance by student
const ListStudentPaymentsByStudentController = () =>
  import('#controllers/student_payments/list_student_payments_by_student_controller')
const ListStudentBalanceByStudentController = () =>
  import('#controllers/student_balance_transactions/list_student_balance_by_student_controller')
const GetStudentBalanceController = () =>
  import('#controllers/student_balance_transactions/get_student_balance_controller')
const GetStudentAttendanceController = () =>
  import('#controllers/attendance/get_student_attendance_controller')

export function registerStudentApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexStudentsController]).as('students.index')
      router.post('/', [StoreStudentController]).as('students.store')
      router.post('/enroll', [EnrollStudentController]).as('students.enroll')
      router.get('/check-document', [CheckDocumentController]).as('students.checkDocument')
      router.get('/check-email', [CheckEmailController]).as('students.checkEmail')
      router
        .get('/lookup-responsible', [LookupResponsibleController])
        .as('students.lookupResponsible')
      router.get('/:id', [ShowStudentController]).as('students.show')
      router.put('/:id', [UpdateStudentController]).as('students.update')
      router.put('/:id/full', [FullUpdateStudentController]).as('students.fullUpdate')
      router.delete('/:id', [DestroyStudentController]).as('students.destroy')
      router
        .get('/:id/enrollments', [ListStudentEnrollmentsController])
        .as('students.enrollments.list')
      router
        .patch('/:id/enrollments/:enrollmentId', [UpdateEnrollmentController])
        .as('students.enrollments.update')
      router
        .delete('/:id/enrollments/:enrollmentId', [CancelEnrollmentController])
        .as('students.enrollments.cancel')
      router
        .get('/:studentId/attendance', [GetStudentAttendanceController])
        .as('students.attendance')

      // Student Payments
      router
        .get('/:studentId/payments', [ListStudentPaymentsByStudentController])
        .as('students.payments')

      // Student Balance
      router.get('/:studentId/balance', [GetStudentBalanceController]).as('students.balance')
      router
        .get('/:studentId/balance-transactions', [ListStudentBalanceByStudentController])
        .as('students.balanceTransactions')
    })
    .prefix('/students')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerResponsibleApiRoutes() {
  router
    .group(() => {
      router
        .get('/students/:studentId/responsibles', [ListStudentResponsiblesController])
        .as('responsibles.listByStudent')
      router.post('/', [AssignResponsibleController]).as('responsibles.assign')
      router
        .patch('/:id', [UpdateResponsibleAssignmentController])
        .as('responsibles.updateAssignment')
      router.delete('/:id', [RemoveResponsibleController]).as('responsibles.remove')
    })
    .prefix('/responsibles')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerResponsibleAddressApiRoutes() {
  router
    .group(() => {
      router
        .get('/:responsibleId', [ShowResponsibleAddressController])
        .as('responsibleAddresses.show')
      router.post('/', [CreateResponsibleAddressController]).as('responsibleAddresses.create')
    })
    .prefix('/responsible-addresses')
    .use([middleware.auth(), middleware.impersonation()])
}
