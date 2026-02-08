import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Online Enrollment
const GetSchoolEnrollmentInfoController = () =>
  import('#controllers/online-enrollment/get_school_enrollment_info_controller')
const CheckExistingStudentController = () =>
  import('#controllers/online-enrollment/check_existing_student_controller')
const FindScholarshipByCodeController = () =>
  import('#controllers/online-enrollment/find_scholarship_by_code_controller')
const FinishEnrollmentController = () =>
  import('#controllers/online-enrollment/finish_enrollment_controller')

// Enrollment Management
const ListEnrollmentsController = () =>
  import('#controllers/enrollments/list_enrollments_controller')
const UpdateDocumentStatusController = () =>
  import('#controllers/enrollments/update_document_status_controller')

export function registerOnlineEnrollmentApiRoutes() {
  router
    .group(() => {
      router
        .get('/:schoolSlug/:academicPeriodSlug/:courseSlug/info', [
          GetSchoolEnrollmentInfoController,
        ])
        .as('enrollment.info')
      router
        .post('/check-existing', [CheckExistingStudentController])
        .as('enrollment.checkExisting')
      router
        .post('/find-scholarship', [FindScholarshipByCodeController])
        .as('enrollment.findScholarship')
      router.post('/finish', [FinishEnrollmentController]).as('enrollment.finish')
    })
    .prefix('/online-enrollment')
}

export function registerEnrollmentManagementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListEnrollmentsController]).as('enrollments.index')
      router
        .patch('/documents/:id/status', [UpdateDocumentStatusController])
        .as('enrollments.documents.updateStatus')
    })
    .prefix('/enrollments')
    .use([middleware.auth(), middleware.impersonation()])
}
