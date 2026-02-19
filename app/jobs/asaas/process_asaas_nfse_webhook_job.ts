import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import Invoice from '#models/invoice'
import WebhookEvent from '#models/webhook_event'
import NfseAuthorizedMail from '#mails/nfse_authorized_mail'

interface ProcessAsaasNfseWebhookPayload {
  webhookEventId: string
}

export default class ProcessAsaasNfseWebhookJob extends Job<ProcessAsaasNfseWebhookPayload> {
  static readonly jobName = 'ProcessAsaasNfseWebhookJob'

  static options = {
    queue: 'payments',
    maxRetries: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { webhookEventId } = this.payload

    const webhookEvent = await WebhookEvent.find(webhookEventId)
    if (!webhookEvent) {
      console.warn(`[ASAAS_NFSE_WEBHOOK] WebhookEvent ${webhookEventId} not found - skipping`)
      return
    }

    if (webhookEvent.status === 'COMPLETED') {
      console.log(
        `[ASAAS_NFSE_WEBHOOK] WebhookEvent ${webhookEventId} already completed - skipping`
      )
      return
    }

    const payload = webhookEvent.payload as {
      event: string
      invoice: {
        id: string
        payment?: string
        status?: string
        number?: string
        rpsSerie?: string
        rpsNumber?: string
        pdfUrl?: string
        xmlUrl?: string
        effectiveDate?: string
        error?: string
      }
    }

    try {
      webhookEvent.status = 'PROCESSING'
      webhookEvent.attempts += 1
      await webhookEvent.save()

      // Find invoice by nfseId or by paymentGatewayId (the Asaas payment ID)
      let invoice = await Invoice.query().where('nfseId', payload.invoice.id).first()
      if (!invoice && payload.invoice.payment) {
        invoice = await Invoice.query().where('paymentGatewayId', payload.invoice.payment).first()
      }

      if (!invoice) {
        console.warn(
          `[ASAAS_NFSE_WEBHOOK] No invoice found for NFS-e ${payload.invoice.id} - skipping`
        )
        webhookEvent.status = 'FAILED'
        webhookEvent.error = `No invoice found for NFS-e ${payload.invoice.id}`
        await webhookEvent.save()
        return
      }

      // Update nfseId if not yet set
      if (!invoice.nfseId) {
        invoice.nfseId = payload.invoice.id
      }

      switch (payload.event) {
        case 'INVOICE_AUTHORIZED':
          invoice.nfseStatus = 'AUTHORIZED'
          invoice.nfseNumber = payload.invoice.number ?? invoice.nfseNumber
          invoice.nfsePdfUrl = payload.invoice.pdfUrl ?? invoice.nfsePdfUrl
          invoice.nfseXmlUrl = payload.invoice.xmlUrl ?? invoice.nfseXmlUrl
          invoice.nfseRpsNumber = payload.invoice.rpsNumber ?? invoice.nfseRpsNumber
          if (payload.invoice.effectiveDate) {
            invoice.nfseIssuedAt = DateTime.fromISO(payload.invoice.effectiveDate)
          }
          invoice.nfseErrorMessage = null
          break
        case 'INVOICE_PROCESSING_CANCELLATION':
          invoice.nfseStatus = 'PROCESSING_CANCELLATION'
          break
        case 'INVOICE_CANCELED':
          invoice.nfseStatus = 'CANCELLED'
          break
        case 'INVOICE_CANCELLATION_DENIED':
          invoice.nfseStatus = 'CANCELLATION_DENIED'
          break
        case 'INVOICE_ERROR':
          invoice.nfseStatus = 'ERROR'
          invoice.nfseErrorMessage = payload.invoice.error ?? 'Unknown error'
          break
        default:
          break
      }

      await invoice.save()

      // Send NFS-e email to financial responsible on INVOICE_AUTHORIZED
      if (payload.event === 'INVOICE_AUTHORIZED' && invoice.nfsePdfUrl) {
        try {
          await invoice.load('student', (q) => q.preload('user'))
          const student = invoice.student

          const monthYear =
            invoice.month && invoice.year
              ? `${String(invoice.month).padStart(2, '0')}/${invoice.year}`
              : '-'
          const totalFormatted = Number(invoice.totalAmount).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })

          const mailProps = {
            studentName: student.user.name,
            monthYear,
            totalFormatted,
            nfseNumber: invoice.nfseNumber ?? '-',
            nfsePdfUrl: invoice.nfsePdfUrl,
          }

          if (student.isSelfResponsible) {
            if (student.user.email) {
              await mail.send(
                new NfseAuthorizedMail({
                  ...mailProps,
                  to: student.user.email,
                  responsibleName: student.user.name,
                })
              )
            }
          } else {
            await student.load('responsibles', (q) =>
              q.where('isFinancial', true).preload('responsible')
            )
            for (const rel of student.responsibles) {
              if (rel.responsible.email) {
                await mail.send(
                  new NfseAuthorizedMail({
                    ...mailProps,
                    to: rel.responsible.email,
                    responsibleName: rel.responsible.name,
                  })
                )
              }
            }
          }

          console.log(`[ASAAS_NFSE_WEBHOOK] NFS-e email sent for invoice ${invoice.id}`)
        } catch (emailError) {
          console.warn(
            `[ASAAS_NFSE_WEBHOOK] Failed to send NFS-e email for invoice ${invoice.id}:`,
            emailError
          )
        }
      }

      webhookEvent.status = 'COMPLETED'
      webhookEvent.processedAt = DateTime.now()
      webhookEvent.error = null
      await webhookEvent.save()

      console.log(`[ASAAS_NFSE_WEBHOOK] NFS-e webhook processed: ${webhookEventId}`)
    } catch (error) {
      webhookEvent.status = 'FAILED'
      webhookEvent.error = error instanceof Error ? error.message : String(error)
      await webhookEvent.save()
      throw error
    }
  }
}
