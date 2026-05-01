import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'

export default class SchoolAnnouncementMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')

  constructor(
    private recipient: User,
    private schoolName: string,
    private announcementTitle: string,
    private announcementBody: string,
    private actionUrl: string
  ) {
    super()
    this.subject = `Novo comunicado - ${schoolName}`
  }

  prepare() {
    this.message.to(this.recipient.email!)
    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">${this.schoolName}</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
          <p style="margin-top: 0;">Ola, ${this.recipient.name}.</p>
          <p>A escola enviou um novo comunicado para voce:</p>
          <h3 style="margin: 16px 0 8px;">${this.announcementTitle}</h3>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 8px 0 16px; background-color: #f9fafb; white-space: pre-wrap;">
            ${this.announcementBody}
          </div>
          <p>Acesse para visualizar: <a href="${this.actionUrl}" style="color: #2563eb;">${this.actionUrl}</a></p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Equipe Anua</p>
        </div>
      </div>
    `)
  }
}
