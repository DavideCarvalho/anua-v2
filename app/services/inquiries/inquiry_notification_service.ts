import mail from '@adonisjs/mail/services/main'
import Notification from '#models/notification'
import type ParentInquiry from '#models/parent_inquiry'
import User from '#models/user'
import InquiryCreatedMail from '#mails/inquiry_created_mail'
import InquiryMessageMail from '#mails/inquiry_message_mail'

export interface NotifyInquiryCreatedParams {
  inquiry: ParentInquiry
  recipientIds: string[]
}

export interface NotifyInquiryMessageParams {
  inquiry: ParentInquiry
  messageAuthorId: string
  messageAuthorName: string
  messageBody: string
  notifyUserIds: string[]
}

export interface NotifyInquiryResolvedParams {
  inquiry: ParentInquiry
  resolvedByName: string
  notifyUserIds: string[]
}

export async function notifyInquiryCreated(params: NotifyInquiryCreatedParams) {
  const { inquiry, recipientIds } = params

  const recipients = await User.query()
    .whereIn('id', recipientIds)
    .where('active', true)
    .select(['id', 'name', 'email'])

  await Promise.all(
    recipients.map(async (recipient) => {
      const notification = await Notification.create({
        userId: recipient.id,
        type: 'INQUIRY_CREATED',
        title: 'Nova pergunta',
        message: `Uma nova pergunta foi criada: ${inquiry.subject}`,
        data: {
          kind: 'inquiry_created',
          inquiryId: inquiry.id,
          studentId: inquiry.studentId,
        },
        isRead: false,
        sentViaInApp: true,
        sentViaEmail: true,
        sentViaPush: false,
        sentViaSms: false,
        sentViaWhatsApp: false,
        actionUrl: `/escola/duvidas-responsaveis/${inquiry.id}`,
      })

      if (recipient.email) {
        try {
          await mail.sendLater(new InquiryCreatedMail(recipient, inquiry, notification.actionUrl!))
        } catch (error) {
          notification.emailError = error instanceof Error ? error.message : 'Unknown error'
          await notification.save()
        }
      }
    })
  )
}

export async function notifyInquiryMessage(params: NotifyInquiryMessageParams) {
  const { inquiry, messageAuthorId, messageAuthorName, messageBody, notifyUserIds } = params

  if (notifyUserIds.length === 0) return

  const users = await User.query()
    .whereIn('id', notifyUserIds)
    .where('active', true)
    .select(['id', 'name', 'email'])

  const actionUrl = `/responsavel/perguntas/${inquiry.id}`

  await Promise.all(
    users.map(async (user) => {
      const notification = await Notification.create({
        userId: user.id,
        type: 'INQUIRY_MESSAGE',
        title: 'Nova mensagem na pergunta',
        message: `${messageAuthorName} respondeu à pergunta: ${inquiry.subject}`,
        data: {
          kind: 'inquiry_message',
          inquiryId: inquiry.id,
          studentId: inquiry.studentId,
          authorId: messageAuthorId,
        },
        isRead: false,
        sentViaInApp: true,
        sentViaEmail: true,
        sentViaPush: false,
        sentViaSms: false,
        sentViaWhatsApp: false,
        actionUrl,
      })

      if (user.email) {
        try {
          await mail.sendLater(
            new InquiryMessageMail(user, inquiry, messageAuthorName, messageBody, actionUrl)
          )
        } catch (error) {
          notification.emailError = error instanceof Error ? error.message : 'Unknown error'
          await notification.save()
        }
      }
    })
  )
}

export async function notifyInquiryResolved(params: NotifyInquiryResolvedParams) {
  const { inquiry, resolvedByName, notifyUserIds } = params

  if (notifyUserIds.length === 0) return

  const users = await User.query()
    .whereIn('id', notifyUserIds)
    .where('active', true)
    .select(['id', 'name', 'email'])

  const actionUrl = `/responsavel/perguntas/${inquiry.id}`

  await Promise.all(
    users.map(async (user) => {
      await Notification.create({
        userId: user.id,
        type: 'INQUIRY_RESOLVED',
        title: 'Pergunta resolvida',
        message: `${resolvedByName} marcou a pergunta como resolvida: ${inquiry.subject}`,
        data: {
          kind: 'inquiry_resolved',
          inquiryId: inquiry.id,
          studentId: inquiry.studentId,
        },
        isRead: false,
        sentViaInApp: true,
        sentViaEmail: false,
        sentViaPush: false,
        sentViaSms: false,
        sentViaWhatsApp: false,
        actionUrl,
      })
    })
  )
}
