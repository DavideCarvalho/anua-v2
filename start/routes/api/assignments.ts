import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAssignmentApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.assignments.ListAssignments]).as('assignments.index')
      router.post('/', [controllers.assignments.CreateAssignment]).as('assignments.store')
      router.get('/:id', [controllers.assignments.ShowAssignment]).as('assignments.show')
      router
        .get('/:id/history', [controllers.assignments.ListAssignmentHistory])
        .as('assignments.history')
      router.put('/:id', [controllers.assignments.UpdateAssignment]).as('assignments.update')
      router.delete('/:id', [controllers.assignments.DeleteAssignment]).as('assignments.destroy')
      router
        .get('/:id/submissions', [controllers.assignments.ListAssignmentSubmissions])
        .as('assignments.submissions')
      router
        .post('/:id/submissions', [controllers.assignments.SubmitAssignment])
        .as('assignments.submit')
      router
        .post('/:id/submissions/:submissionId', [controllers.assignments.GradeSubmission])
        .as('assignments.submissions.grade')
    })
    .prefix('/assignments')
    .use([middleware.auth(), middleware.impersonation()])
}
