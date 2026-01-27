import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetNotificationsController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Get all students that this responsible has access to
    const studentRelations = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .preload('student')

    const studentIds = studentRelations.map((r) => r.studentId)

    if (studentIds.length === 0) {
      return response.ok({
        data: [],
        meta: {
          total: 0,
          perPage: limit,
          currentPage: page,
          lastPage: 1,
          firstPage: 1,
          hasMorePages: false,
        },
        unreadCount: 0,
      })
    }

    // Get notifications for these students
    // Note: Notification model uses 'message' field, not 'body'
    const notifications = await Notification.query()
      .whereIn('userId', studentIds)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Count unread notifications
    const unreadCount = await Notification.query()
      .whereIn('userId', studentIds)
      .where('isRead', false)
      .count('* as total')

    return response.ok({
      data: notifications.all().map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.message, // Notification model uses 'message' field
        isRead: n.isRead,
        createdAt: n.createdAt,
        userId: n.userId,
      })),
      meta: notifications.getMeta(),
      unreadCount: Number(unreadCount[0]?.$extras.total || 0),
    })
  }
}
