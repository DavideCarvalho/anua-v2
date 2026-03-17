import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { createPurchaseRequestValidator } from '#validators/purchase_request'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import PurchaseRequestTransformer from '#transformers/purchase_request_transformer'

export default class CreatePurchaseRequestController {
  async handle({ request, response, auth, serialize }: HttpContext) {
    const data = await request.validateUsing(createPurchaseRequestValidator)

    const purchaseRequest = await PurchaseRequest.create({
      id: randomUUID(),
      schoolId: data.schoolId,
      requestingUserId: auth.user!.id,
      productName: data.productName,
      quantity: data.quantity,
      unitValue: data.unitValue,
      value: data.value,
      dueDate: DateTime.fromJSDate(data.dueDate),
      productUrl: data.productUrl ?? null,
      description: data.description ?? null,
      status: 'REQUESTED',
    })

    await purchaseRequest.load('requestingUser')

    return response.created(await serialize(PurchaseRequestTransformer.transform(purchaseRequest)))
  }
}
