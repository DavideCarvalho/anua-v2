import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { getCanteenReportValidator } from '#validators/canteen'

export default class GetCanteenReportController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(getCanteenReportValidator)

    const now = DateTime.now()
    const start = payload.startDate
      ? DateTime.fromJSDate(payload.startDate).startOf('day')
      : now.minus({ days: 30 }).startOf('day')
    const end = payload.endDate
      ? DateTime.fromJSDate(payload.endDate).endOf('day')
      : now.endOf('day')

    const startSql = start.toSQL()
    const endSql = end.toSQL()

    if (!startSql || !endSql) {
      return response.badRequest({ message: 'Período inválido' })
    }

    const summary = await db
      .from('canteen_purchases')
      .where('canteen_id', payload.canteenId)
      .where('status', 'PAID')
      .whereBetween('created_at', [startSql, endSql])
      .sum('total_amount as totalRevenue')
      .count('* as totalOrders')
      .first()

    const paymentsByMethod = await db
      .from('canteen_purchases')
      .where('canteen_id', payload.canteenId)
      .where('status', 'PAID')
      .whereBetween('created_at', [startSql, endSql])
      .select('payment_method as paymentMethod')
      .sum('total_amount as totalRevenue')
      .count('* as totalOrders')
      .groupBy('payment_method')

    const topItemsLimit = payload.topItemsLimit ?? 5

    const topItems = await db
      .from('canteen_item_purchased')
      .join(
        'canteen_purchases',
        'canteen_item_purchased.canteen_purchase_id',
        'canteen_purchases.id'
      )
      .join('canteen_items', 'canteen_item_purchased.canteen_item_id', 'canteen_items.id')
      .where('canteen_purchases.canteen_id', payload.canteenId)
      .where('canteen_purchases.status', 'PAID')
      .whereBetween('canteen_purchases.created_at', [startSql, endSql])
      .select('canteen_items.id', 'canteen_items.name')
      .sum('canteen_item_purchased.quantity as totalQuantity')
      .sum('canteen_item_purchased.total_price as totalRevenue')
      .groupBy('canteen_items.id', 'canteen_items.name')
      .orderBy('totalQuantity', 'desc')
      .limit(topItemsLimit)

    const reservationSummary = await db
      .from('canteen_meal_reservations')
      .join('canteen_meals', 'canteen_meal_reservations.canteen_meal_id', 'canteen_meals.id')
      .where('canteen_meals.canteen_id', payload.canteenId)
      .whereBetween('canteen_meals.served_at', [startSql, endSql])
      .select('canteen_meal_reservations.status')
      .count('* as total')
      .groupBy('canteen_meal_reservations.status')

    const totalRevenue = Number(summary?.$extras.totalRevenue ?? summary?.totalRevenue ?? 0)
    const totalOrders = Number(summary?.$extras.totalOrders ?? summary?.totalOrders ?? 0)

    return response.ok({
      period: {
        start: start.toISO(),
        end: end.toISO(),
      },
      totals: {
        totalRevenue,
        totalOrders,
        averageTicket: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
      paymentsByMethod: paymentsByMethod.map((entry) => ({
        paymentMethod: entry.paymentMethod,
        totalRevenue: Number(entry.totalRevenue ?? entry.$extras?.totalRevenue ?? 0),
        totalOrders: Number(entry.totalOrders ?? entry.$extras?.totalOrders ?? 0),
      })),
      topItems: topItems.map((item) => ({
        itemId: item.id,
        name: item.name,
        totalQuantity: Number(item.totalQuantity ?? item.$extras?.totalQuantity ?? 0),
        totalRevenue: Number(item.totalRevenue ?? item.$extras?.totalRevenue ?? 0),
      })),
      reservationsByStatus: reservationSummary.map((entry) => ({
        status: entry.status,
        total: Number(entry.total ?? entry.$extras?.total ?? 0),
      })),
    })
  }
}
