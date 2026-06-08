import User from '#models/user'
import Role from '#models/role'
import UserHasSchool from '#models/user_has_school'
import Notification from '#models/notification'
import type { NotificationType } from '#models/notification'
import { v7 as uuidv7 } from 'uuid'

interface NotifyParams {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  actionUrl?: string
}

export async function notifySchoolStaff(schoolId: string, params: NotifyParams) {
  const staffRoles = await Role.query().whereIn('name', [
    'SCHOOL_DIRECTOR',
    'SCHOOL_COORDINATOR',
    'SCHOOL_ADMIN',
  ])
  const staffRoleIds = staffRoles.map((r) => r.id)

  const directUsers = await User.query()
    .where('schoolId', schoolId)
    .whereIn('roleId', staffRoleIds)
    .where('active', true)

  const linkedUserSchools = await UserHasSchool.query().where('schoolId', schoolId).preload('user')

  const userIds = new Set<string>()
  for (const u of directUsers) userIds.add(u.id)
  for (const uhs of linkedUserSchools) {
    if (uhs.user?.active && uhs.user.roleId && staffRoleIds.includes(uhs.user.roleId)) {
      userIds.add(uhs.userId)
    }
  }

  for (const userId of userIds) {
    await Notification.create({
      id: uuidv7(),
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data ?? null,
      isRead: false,
      sentViaInApp: true,
      sentViaEmail: false,
      sentViaWhatsApp: false,
      sentViaPush: false,
    })
  }
}
