import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import { createStoreValidator } from '#validators/store'

export default class CreateStoreController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStoreValidator)

    const store = await Store.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    await store.load('school')
    if (store.ownerUserId) {
      await store.load('owner')
    }

    return response.created(store)
  }
}
