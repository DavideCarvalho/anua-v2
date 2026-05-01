import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class GetNotificationsController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Get all students that this responsible has access to
    const studentRelations = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .preload('student')

    const studentIds = studentRelations.map((r) => r.studentId)

    const userIds = studentIds.length > 0 ? [...studentIds, effectiveUser.id] : [effectiveUser.id]

    // Get notifications for the responsible user AND their linked students
    // Notifications can have userId = studentId (student-based) or userId = responsibleId (direct)
    // Note: Notification model uses 'message' field, not 'body'
    const notifications = await Notification.query()
      .whereIn('userId', userIds)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Count unread notifications
    const unreadCount = await Notification.query()
      .whereIn('userId', userIds)
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
