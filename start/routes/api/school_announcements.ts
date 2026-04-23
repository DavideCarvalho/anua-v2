import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListSchoolAnnouncementsController = () =>
  import('#controllers/school_announcements/list_school_announcements_controller')
const ShowSchoolAnnouncementController = () =>
  import('#controllers/school_announcements/show_school_announcement_controller')
const CreateSchoolAnnouncementController = () =>
  import('#controllers/school_announcements/create_school_announcement_controller')
const UpdateSchoolAnnouncementController = () =>
  import('#controllers/school_announcements/update_school_announcement_controller')
const DeleteSchoolAnnouncementController = () =>
  import('#controllers/school_announcements/delete_school_announcement_controller')
const PublishSchoolAnnouncementController = () =>
  import('#controllers/school_announcements/publish_school_announcement_controller')
const ListSchoolAnnouncementStudentsController = () =>
  import('#controllers/school_announcements/list_school_announcement_students_controller')

export function registerSchoolAnnouncementApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSchoolAnnouncementsController]).as('school_announcements.list')
      router.post('/', [CreateSchoolAnnouncementController]).as('school_announcements.create')
      router.get('/:id', [ShowSchoolAnnouncementController]).as('school_announcements.details')
      router.put('/:id', [UpdateSchoolAnnouncementController]).as('school_announcements.edit_draft')
      router
        .delete('/:id', [DeleteSchoolAnnouncementController])
        .as('school_announcements.delete_draft')
      router
        .post('/:id/publish', [PublishSchoolAnnouncementController])
        .as('school_announcements.publish_draft')
      router
        .get('/audience/students', [ListSchoolAnnouncementStudentsController])
        .as('school_announcements.audience_students')
    })
    .prefix('/school-announcements')
    .use([middleware.auth(), middleware.impersonation()])
}
