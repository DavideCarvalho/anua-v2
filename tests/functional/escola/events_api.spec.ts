import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Events API (escola/calendario)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('updates paid event fields without referencing removed camelCase columns', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const eventId = randomUUID()
    const now = DateTime.now()

    await db.table('Event').insert({
      id: eventId,
      createdAt: now.toSQL(),
      updatedAt: now.toSQL(),
      title: 'Evento original',
      type: 'ACADEMIC_EVENT',
      status: 'DRAFT',
      visibility: 'INTERNAL',
      priority: 'NORMAL',
      startDate: now.plus({ days: 1 }).toSQL(),
      endDate: null,
      startTime: null,
      endTime: null,
      isAllDay: false,
      location: null,
      locationDetails: null,
      isOnline: false,
      onlineUrl: null,
      isExternal: false,
      organizerId: user.id,
      maxParticipants: null,
      currentParticipants: 0,
      requiresRegistration: false,
      registrationDeadline: null,
      requiresParentalConsent: false,
      allowComments: true,
      sendNotifications: true,
      isRecurring: false,
      recurringPattern: null,
      bannerUrl: null,
      attachments: null,
      tags: null,
      metadata: null,
      schoolId: school.id,
      createdBy: user.id,
      has_additional_costs: false,
      additional_cost_amount: null,
      additional_cost_installments: null,
      additional_cost_description: null,
    })

    const response = await client.put(`/api/v1/events/${eventId}`).loginAs(user).json({
      hasAdditionalCosts: true,
      additionalCostAmount: 150,
      additionalCostInstallments: 3,
      additionalCostDescription: 'Transporte para passeio',
    })

    response.assertStatus(200)
    assert.isTrue(response.body().hasAdditionalCosts)
    assert.equal(response.body().additionalCostAmount, 150)
    assert.equal(response.body().additionalCostInstallments, 3)
    assert.equal(response.body().additionalCostDescription, 'Transporte para passeio')

    const savedEvent = await db
      .from('Event')
      .where('id', eventId)
      .select([
        'has_additional_costs',
        'additional_cost_amount',
        'additional_cost_installments',
        'additional_cost_description',
      ])
      .first()

    assert.isTrue(Boolean(savedEvent?.has_additional_costs))
    assert.equal(savedEvent?.additional_cost_amount, 150)
    assert.equal(savedEvent?.additional_cost_installments, 3)
    assert.equal(savedEvent?.additional_cost_description, 'Transporte para passeio')
  })
})
