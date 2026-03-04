import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentAvatar from '#models/student_avatar'
import Student from '#models/student'
import StudentGamification from '#models/student_gamification'
import StoreItem from '#models/store_item'
import PointTransaction from '#models/point_transaction'
import AppException from '#exceptions/app_exception'
import vine from '@vinejs/vine'

const AVATAR_CATEGORIES = ['AVATAR_HAIR', 'AVATAR_OUTFIT', 'AVATAR_ACCESSORY'] as const

const purchaseAvatarItemValidator = vine.compile(
  vine.object({
    storeItemId: vine.string(),
    slot: vine.enum(['hair', 'outfit', 'accessory'] as const),
  })
)

export default class PurchaseAvatarItemController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const student = await Student.find(user.id)
    if (!student) {
      throw AppException.forbidden('Usuário não é um aluno')
    }

    const payload = await request.validateUsing(purchaseAvatarItemValidator)

    const storeItem = await StoreItem.query()
      .where('id', payload.storeItemId)
      .where('paymentMode', 'POINTS_ONLY')
      .whereIn('category', [...AVATAR_CATEGORIES])
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!storeItem) {
      throw AppException.notFound('Item não encontrado ou não disponível para compra com pontos')
    }

    const pointsCost = storeItem.price
    if (pointsCost <= 0) {
      throw AppException.badRequest('Item inválido')
    }

    const gamification = await StudentGamification.query().where('studentId', student.id).first()

    if (!gamification) {
      throw AppException.notFound('Perfil de gamificação não encontrado')
    }

    if (gamification.totalPoints < pointsCost) {
      throw AppException.badRequest('Pontos insuficientes para esta compra')
    }

    const trx = await db.transaction()

    try {
      const newTotalPoints = gamification.totalPoints - pointsCost
      gamification.totalPoints = newTotalPoints
      gamification.useTransaction(trx)
      await gamification.save()

      await PointTransaction.create(
        {
          studentGamificationId: gamification.id,
          points: -pointsCost,
          balanceAfter: newTotalPoints,
          type: 'SPEND' as const,
          reason: `Compra: ${storeItem.name}`,
          relatedEntityType: 'StoreItem',
          relatedEntityId: storeItem.id,
        },
        { client: trx }
      )

      let avatar = await StudentAvatar.query({ client: trx }).where('studentId', student.id).first()

      if (!avatar) {
        avatar = await StudentAvatar.create(
          {
            studentId: student.id,
            skinTone: 'medium',
            hairStyle: 'default',
            hairColor: 'brown',
            outfit: 'default',
            accessories: [],
          },
          { client: trx }
        )
      }

      if (payload.slot === 'hair') {
        const metadata = (storeItem.metadata as Record<string, unknown>) ?? {}
        avatar.hairStyle = (metadata.style as string) ?? storeItem.id
        avatar.hairColor = (metadata.color as string) ?? 'brown'
      } else if (payload.slot === 'outfit') {
        avatar.outfit = storeItem.id
      } else if (payload.slot === 'accessory') {
        const current = avatar.accessories ?? []
        if (!current.includes(storeItem.id)) {
          avatar.accessories = [...current, storeItem.id]
        }
      }

      avatar.useTransaction(trx)
      await avatar.save()

      await trx.commit()

      return response.ok({
        avatar: {
          id: avatar.id,
          studentId: avatar.studentId,
          skinTone: avatar.skinTone,
          hairStyle: avatar.hairStyle,
          hairColor: avatar.hairColor,
          outfit: avatar.outfit,
          accessories: avatar.accessories,
        },
        pointsSpent: pointsCost,
        newBalance: newTotalPoints,
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
