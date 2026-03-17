import type { HttpContext } from '@adonisjs/core/http'
import { attachmentManager } from '@jrmc/adonis-attachment'
import CanteenItem from '#models/canteen_item'
import { createCanteenItemValidator } from '#validators/canteen'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'

export default class CreateCanteenItemController {
  async handle({ request, response, serialize }: HttpContext) {
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
      canteenId: String(request.input('canteenId') ?? '').trim(),
      name: String(request.input('name') ?? '').trim(),
      description:
        request.input('description') !== undefined
          ? String(request.input('description') ?? '').trim()
          : undefined,
      price: Number(request.input('price')),
      category:
        request.input('category') !== undefined
          ? String(request.input('category') ?? '').trim()
          : undefined,
      isActive:
        request.input('isActive') !== undefined
          ? String(request.input('isActive')) === 'true'
          : undefined,
    }

    const data = await createCanteenItemValidator.validate(rawData)

    const canteenItem = await CanteenItem.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    if (image) {
      canteenItem.image = await attachmentManager.createFromFile(image)
      await canteenItem.save()
    }

    return response.created(await serialize(CanteenItemTransformer.transform(canteenItem)))
  }
}
