import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerOnlineEnrollmentApiRoutes() {
  router
    .group(() => {
      router
        .get('/:schoolSlug/:academicPeriodSlug/:courseSlug/info', [
          controllers.onlineEnrollment.GetSchoolEnrollmentInfo,
        ])
        .as('enrollment.info')
      router
        .post('/check-existing', [controllers.onlineEnrollment.CheckExistingStudent])
        .as('enrollment.check_existing')
      router
        .post('/find-scholarship', [controllers.onlineEnrollment.FindScholarshipByCode])
        .as('enrollment.find_scholarship')
      router
        .post('/finish', [controllers.onlineEnrollment.FinishEnrollment])
        .as('enrollment.finish')
    })
    .prefix('/online-enrollment')
}

export function registerEnrollmentManagementApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.enrollments.ListEnrollments]).as('enrollments.index')
      router
        .get('/action-counts', [controllers.enrollments.GetActionCounts])
        .as('enrollments.action_counts')
      router
        .patch('/documents/:id/status', [controllers.enrollments.UpdateDocumentStatus])
        .as('enrollments.documents.update_status')
    })
    .prefix('/enrollments')
    .use([middleware.auth(), middleware.impersonation()])
}
