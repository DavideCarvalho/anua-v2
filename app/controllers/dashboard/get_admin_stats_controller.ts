import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import Student from '#models/student'
import Teacher from '#models/teacher'
import Subscription from '#models/subscription'
import SubscriptionInvoice from '#models/subscription_invoice'

export default class GetAdminStatsController {
  async handle({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    await user.load('role')
    const roleName = user.role?.name
    if (roleName !== 'SUPER_ADMIN' && roleName !== 'ADMIN') {
      return response.forbidden({ message: 'Acesso negado' })
    }

    const totalSchools = await School.query()
      .whereNull('deletedAt')
      .count('* as total')
      .first()

    const activeSchools = await School.query()
      .whereNull('deletedAt')
      .where('active', true)
      .count('* as total')
      .first()

    const trialSchools = await Subscription.query()
      .where('status', 'TRIAL')
      .count('* as total')
      .first()

    const blockedSchools = await Subscription.query()
      .where('status', 'BLOCKED')
      .count('* as total')
      .first()

    const totalStudents = await Student.query().count('* as total').first()

    const totalTeachers = await Teacher.query()
      .whereNull('deletedAt')
      .count('* as total')
      .first()

    const activeSubscriptions = await Subscription.query()
      .where('status', 'ACTIVE')
      .sum('currentPrice as total')
      .first()

    const pendingInvoices = await SubscriptionInvoice.query()
      .where('status', 'PENDING')
      .count('* as total')
      .first()

    return {
      totalSchools: Number(totalSchools?.$extras.total) || 0,
      activeSchools: Number(activeSchools?.$extras.total) || 0,
      totalStudents: Number(totalStudents?.$extras.total) || 0,
      totalTeachers: Number(totalTeachers?.$extras.total) || 0,
      monthlyRevenue: Number(activeSubscriptions?.$extras.total) || 0,
      pendingInvoices: Number(pendingInvoices?.$extras.total) || 0,
      trialSchools: Number(trialSchools?.$extras.total) || 0,
      blockedSchools: Number(blockedSchools?.$extras.total) || 0,
    }
  }
}
