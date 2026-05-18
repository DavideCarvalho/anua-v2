import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerStudentApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.students.Index]).as('students.index')
      router.post('/', [controllers.students.Store]).as('students.store')
      router.post('/enroll', [controllers.students.EnrollStudent]).as('students.enroll')
      router
        .get('/check-document', [controllers.students.CheckDocument])
        .as('students.check_document')
      router.get('/check-email', [controllers.students.CheckEmail]).as('students.check_email')
      router
        .get('/lookup-responsible', [controllers.students.LookupResponsible])
        .as('students.lookup_responsible')
      // Student avatar (me = current student)
      router
        .get('/me/avatar', [controllers.studentAvatars.ShowStudentAvatar])
        .as('students.me.avatar.show')
      router
        .put('/me/avatar', [controllers.studentAvatars.UpdateStudentAvatar])
        .as('students.me.avatar.update')
      router
        .post('/me/avatar/purchase', [controllers.studentAvatars.PurchaseAvatarItem])
        .as('students.me.avatar.purchase')
      router.get('/:id', [controllers.students.Show]).as('students.show')
      router.put('/:id', [controllers.students.Update]).as('students.update')
      router.put('/:id/full', [controllers.students.FullUpdateStudent]).as('students.full_update')
      router.delete('/:id', [controllers.students.Destroy]).as('students.destroy')
      router
        .get('/:id/enrollments', [controllers.students.ListEnrollments])
        .as('students.enrollments.list')
      router
        .patch('/:id/enrollments/:enrollmentId', [controllers.students.UpdateEnrollment])
        .as('students.enrollments.update')
      router
        .delete('/:id/enrollments/:enrollmentId', [controllers.students.CancelEnrollment])
        .as('students.enrollments.cancel')
      router
        .get('/:studentId/attendance', [controllers.attendance.GetStudentAttendance])
        .as('students.attendance')

      // Student Payments
      router
        .get('/:studentId/payments', [controllers.studentPayments.ListStudentPaymentsByStudent])
        .as('students.payments')

      // Student Balance
      router
        .get('/:studentId/balance', [controllers.studentBalanceTransactions.GetStudentBalance])
        .as('students.balance')
      router
        .get('/:studentId/balance-transactions', [
          controllers.studentBalanceTransactions.ListStudentBalanceByStudent,
        ])
        .as('students.balance_transactions')
    })
    .prefix('/students')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerResponsibleApiRoutes() {
  router
    .group(() => {
      router
        .get('/students/:studentId/responsibles', [
          controllers.responsibles.ListStudentResponsibles,
        ])
        .as('responsibles.list_by_student')
      router.post('/', [controllers.responsibles.AssignResponsible]).as('responsibles.assign')
      router
        .patch('/:id', [controllers.responsibles.UpdateResponsibleAssignment])
        .as('responsibles.update_assignment')
      router.delete('/:id', [controllers.responsibles.RemoveResponsible]).as('responsibles.remove')
    })
    .prefix('/responsibles')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerResponsibleAddressApiRoutes() {
  router
    .group(() => {
      router
        .get('/:responsibleId', [controllers.responsibleAddresses.ShowResponsibleAddress])
        .as('responsible_addresses.show')
      router
        .post('/', [controllers.responsibleAddresses.CreateResponsibleAddress])
        .as('responsible_addresses.create')
    })
    .prefix('/responsible-addresses')
    .use([middleware.auth(), middleware.impersonation()])
}
