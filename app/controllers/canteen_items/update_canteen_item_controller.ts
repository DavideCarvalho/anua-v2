import type { HttpContext } from '@adonisjs/core/http'
import { attachmentManager } from '@jrmc/adonis-attachment'
import db from '@adonisjs/lucid/services/db'
import CanteenItem from '#models/canteen_item'
import CanteenItemDto from '#models/dto/canteen_item.dto'
import { updateCanteenItemValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class UpdateCanteenItemController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const canteenItem = await CanteenItem.query()
      .where('id', params.id)
      .whereHas('canteen', (canteenQuery) => {
        canteenQuery.whereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (image && !image.isValid) {
      return response.badRequest({
        message: image.errors[0]?.message || 'Imagem inválida',
      })
    }

    const rawData = {
      name:
        request.input('name') !== undefined
          ? String(request.input('name') ?? '').trim()
          : undefined,
      description:
        request.input('description') !== undefined
          ? String(request.input('description') ?? '').trim()
          : undefined,
      price: request.input('price') !== undefined ? Number(request.input('price')) : undefined,
      category:
        request.input('category') !== undefined
          ? String(request.input('category') ?? '').trim()
          : undefined,
      isActive:
        request.input('isActive') !== undefined
          ? String(request.input('isActive')) === 'true'
          : undefined,
      removeImage:
        request.input('removeImage') !== undefined
          ? String(request.input('removeImage')) === 'true'
          : undefined,
    }

    const data = await updateCanteenItemValidator.validate(rawData)

    const updatedCanteenItem = await db.transaction(async (trx) => {
      canteenItem.merge({
        name: data.name ?? canteenItem.name,
        description: data.description !== undefined ? data.description : canteenItem.description,
        price: data.price !== undefined ? data.price : canteenItem.price,
        category: data.category !== undefined ? data.category : canteenItem.category,
        isActive: data.isActive ?? canteenItem.isActive,
      })

      if (data.removeImage) {
        canteenItem.image = null
      }

      if (image) {
        canteenItem.image = await attachmentManager.createFromFile(image)
      }

      await canteenItem.useTransaction(trx).save()
      return canteenItem
    })

    return response.ok(new CanteenItemDto(updatedCanteenItem))
  }
}
