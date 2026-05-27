import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerSchoolAnnouncementApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolAnnouncements.ListSchoolAnnouncements])
        .as('school_announcements.list')
      router
        .post('/', [controllers.schoolAnnouncements.CreateSchoolAnnouncement])
        .as('school_announcements.create')
      router
        .get('/:id', [controllers.schoolAnnouncements.ShowSchoolAnnouncement])
        .as('school_announcements.details')
      router
        .put('/:id', [controllers.schoolAnnouncements.UpdateSchoolAnnouncement])
        .as('school_announcements.edit_draft')
      router
        .delete('/:id', [controllers.schoolAnnouncements.DeleteSchoolAnnouncement])
        .as('school_announcements.delete_draft')
      router
        .post('/:id/publish', [controllers.schoolAnnouncements.PublishSchoolAnnouncement])
        .as('school_announcements.publish_draft')
      router
        .get('/audience/students', [controllers.schoolAnnouncements.ListSchoolAnnouncementStudents])
        .as('school_announcements.audience_students')
    })
    .prefix('/school-announcements')
    .use([middleware.auth(), middleware.impersonation()])

  router
    .group(() => {
      router
        .get('/', [controllers.announcementTemplates.ListAnnouncementTemplates])
        .as('announcement_templates.list')
      router
        .post('/', [controllers.announcementTemplates.CreateAnnouncementTemplate])
        .as('announcement_templates.create')
      router
        .delete('/:id', [controllers.announcementTemplates.DeleteAnnouncementTemplate])
        .as('announcement_templates.delete')
    })
    .prefix('/announcement-templates')
    .use([middleware.auth(), middleware.impersonation()])
}
