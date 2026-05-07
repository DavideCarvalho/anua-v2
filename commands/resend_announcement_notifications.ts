import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'
import SchoolAnnouncement from '#models/school_announcement'
import Notification from '#models/notification'
import User from '#models/user'
import SchoolAnnouncementMail from '#mails/school_announcement_mail'

export default class ResendAnnouncementNotifications extends BaseCommand {
  static commandName = 'comunicado:resend-notifications'
  static description = 'Reenvia notificações e emails de um comunicado já publicado'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'ID do comunicado', required: true })
  declare announcementId: string

  async run() {
    const announcement = await SchoolAnnouncement.query()
      .where('id', this.announcementId)
      .where('status', 'PUBLISHED')
      .preload('recipients')
      .preload('school')
      .first()

    if (!announcement) {
      this.logger.error('Comunicado não encontrado ou não publicado')
      return
    }

    this.logger.info(`Comunicado: ${announcement.title}`)
    this.logger.info(`Total de destinatários: ${announcement.recipients.length}`)

    let sentCount = 0
    let skippedCount = 0

    for (const recipient of announcement.recipients) {
      if (recipient.notificationId) {
        const notification = await Notification.find(recipient.notificationId)

        if (notification) {
          if (notification.sentViaEmail && notification.emailSentAt) {
            // Ja foi enviado, pula
            skippedCount++
            continue
          }
        }
      }

      // Se nao tem notificacao, cria uma
      let notification: Notification | null = null

      if (recipient.notificationId) {
        notification = await Notification.find(recipient.notificationId)
      }

      if (!notification) {
        const actionUrl = `/responsavel/comunicados?anuncio=${announcement.id}`
        notification = await Notification.create({
          userId: recipient.responsibleId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: announcement.title,
          message: announcement.body,
          data: {
            kind: 'school_announcement',
            announcementId: announcement.id,
          },
          isRead: false,
          sentViaInApp: true,
          sentViaEmail: false,
          sentViaPush: false,
          sentViaSms: false,
          sentViaWhatsApp: false,
          actionUrl,
        })

        recipient.notificationId = notification.id
        await recipient.save()
      }

      if (!notification.sentViaEmail) {
        const user = await User.find(recipient.responsibleId)

        if (user?.email) {
          try {
            const actionUrl = `/responsavel/comunicados?anuncio=${announcement.id}`
            await mail.sendLater(
              new SchoolAnnouncementMail(
                user,
                announcement.school.name,
                announcement.title,
                announcement.body,
                actionUrl
              )
            )

            notification.sentViaEmail = true
            await notification.save()
            sentCount++
          } catch (error) {
            notification.emailError =
              error instanceof Error ? error.message : 'Erro ao enviar email'
            await notification.save()
            this.logger.error(`Erro ao enviar email para ${user.name}: ${notification.emailError}`)
          }
        } else {
          notification.sentViaEmail = true
          await notification.save()
          sentCount++
        }
      } else {
        skippedCount++
      }
    }

    this.logger.info(`Notificações enviadas: ${sentCount}`)
    this.logger.info(`Notificações já enviadas (puladas): ${skippedCount}`)
  }
}
