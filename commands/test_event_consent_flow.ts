import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import drive from '@adonisjs/drive/services/main'
import { v7 as uuidv7 } from 'uuid'
import Event from '#models/event'
import EventParentalConsent from '#models/event_parental_consent'
import Student from '#models/student'
import { startConsentSignature } from '#services/signature/event_consent_signature_service'

const SCHOOL_ID = '019be8e0-590f-70bf-894b-fb7ccc036bfc'
const STUDENT_ID = '019e377c-8364-7309-a02e-99728f13f654' // Aluno Teste M6
const RESPONSIBLE_ID = '019e377c-8405-734a-9bc0-787be095fab3' // resp.teste6
const DIRECTOR_ID = '68a0910c-3125-4878-9115-b44935e47130' // teste@teste.com (createdBy)
const PDF_PATH = '/home/dudousxd/personal/anua-v2/contrato-escola-teste.pdf'

export default class TestEventConsentFlow extends BaseCommand {
  static commandName = 'test:event-consent-flow'
  static description = 'Cria evento com termo de autorização, dispara consent + Autentique'

  static options: CommandOptions = { startApp: true }

  async run() {
    const log = (label: string, payload: unknown) => {
      this.logger.info(`\n=== ${label} ===`)
      console.log(JSON.stringify(payload, null, 2))
    }

    this.logger.info('Step 1: criando evento de teste...')

    const student = await Student.find(STUDENT_ID)
    if (!student) {
      this.logger.error(`Aluno ${STUDENT_ID} não encontrado`)
      return
    }

    const pdfBuffer = await readFile(PDF_PATH)
    const eventId = uuidv7()
    const pdfKey = `events/${eventId}/signature-template-test.pdf`
    await drive.use().put(pdfKey, pdfBuffer, { contentType: 'application/pdf' })

    const event = await Event.create({
      id: eventId,
      schoolId: SCHOOL_ID,
      createdBy: DIRECTOR_ID,
      title: 'Excursão ao Museu — Teste',
      description: 'Excursão didática ao Museu de Ciências.',
      type: 'FIELD_TRIP',
      status: 'DRAFT',
      visibility: 'PARENTS_ONLY',
      priority: 'NORMAL',
      startDate: DateTime.now().plus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 7, hours: 6 }),
      location: 'Museu de Ciências',
      isAllDay: false,
      isOnline: false,
      isExternal: true,
      requiresRegistration: false,
      requiresParentalConsent: true,
      hasAdditionalCosts: false,
      allowComments: false,
      sendNotifications: false,
      isRecurring: false,
      currentParticipants: 0,
      signatureTemplatePdfKey: pdfKey,
      signatureTemplateSchemas: [
        [
          {
            name: 'Assinatura 1',
            type: 'signature',
            position: { x: 25, y: 188 },
            width: 43,
            height: 16,
          },
          {
            name: 'Data 1',
            type: 'date',
            format: 'dd/MM/yyyy',
            position: { x: 100, y: 152 },
            width: 30,
            height: 8,
            locale: 'pt-Br',
          },
        ],
      ],
    })

    this.logger.info(`  → evento ${event.id} criado`)

    this.logger.info('\nStep 2: criando consent manualmente (sem usar job pra acelerar)...')
    const existing = await EventParentalConsent.query()
      .where('eventId', event.id)
      .where('studentId', STUDENT_ID)
      .where('responsibleId', RESPONSIBLE_ID)
      .first()

    let consent = existing
    if (!consent) {
      consent = await EventParentalConsent.create({
        eventId: event.id,
        studentId: STUDENT_ID,
        responsibleId: RESPONSIBLE_ID,
        status: 'PENDING',
        expiresAt: event.startDate,
        reminderCount: 0,
        metadata: { source: 'test:event-consent-flow' },
      })
    }

    this.logger.info(`  → consent ${consent.id} pronto`)

    this.logger.info('\nStep 3: disparando startConsentSignature...')
    const outcome = await startConsentSignature(consent.id)
    log('outcome', outcome)

    if (outcome.status !== 'STARTED') {
      this.logger.error('Não chegou a STARTED')
      return
    }

    await consent.refresh()
    log('consent após signature', {
      id: consent.id,
      status: consent.status,
      signatureSubmissionId: consent.signatureSubmissionId,
      emailSentAt: consent.emailSentAt?.toISO(),
    })

    this.logger.success(
      `\n✓ Teste concluído.\nEvento: ${event.id}\nConsent: ${consent.id}\nAutentique doc: ${outcome.submissionId}\nLink: ${outcome.signatureLink}`
    )
  }
}
