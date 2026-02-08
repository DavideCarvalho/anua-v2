import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Assignments
const ListAssignmentsController = () =>
  import('#controllers/assignments/list_assignments_controller')
const ShowAssignmentController = () => import('#controllers/assignments/show_assignment_controller')
const CreateAssignmentController = () =>
  import('#controllers/assignments/create_assignment_controller')
const UpdateAssignmentController = () =>
  import('#controllers/assignments/update_assignment_controller')
const DeleteAssignmentController = () =>
  import('#controllers/assignments/delete_assignment_controller')
const ListAssignmentSubmissionsController = () =>
  import('#controllers/assignments/list_assignment_submissions_controller')
const SubmitAssignmentController = () =>
  import('#controllers/assignments/submit_assignment_controller')
const GradeSubmissionController = () =>
  import('#controllers/assignments/grade_submission_controller')

export function registerAssignmentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListAssignmentsController]).as('assignments.index')
      router.post('/', [CreateAssignmentController]).as('assignments.store')
      router.get('/:id', [ShowAssignmentController]).as('assignments.show')
      router.put('/:id', [UpdateAssignmentController]).as('assignments.update')
      router.delete('/:id', [DeleteAssignmentController]).as('assignments.destroy')
      router
        .get('/:id/submissions', [ListAssignmentSubmissionsController])
        .as('assignments.submissions')
      router.post('/:id/submissions', [SubmitAssignmentController]).as('assignments.submit')
      router
        .post('/:id/submissions/:submissionId', [GradeSubmissionController])
        .as('assignments.submissions.grade')
    })
    .prefix('/assignments')
    .use([middleware.auth(), middleware.impersonation()])
}
