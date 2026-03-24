import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'
import type ParentInquiry from '#models/parent_inquiry'

export default class InquiryMessageMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')
  subject = 'Nova mensagem na pergunta'

  constructor(
    private recipient: User,
    private inquiry: ParentInquiry,
    private authorName: string,
    private messageBody: string,
    private actionUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.recipient.email!)
    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Nova mensagem na pergunta</h2>
        <p>Ola, ${this.recipient.name}.</p>
        <p><strong>${this.authorName}</strong> respondeu a pergunta.</p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0 0 6px;"><strong>Assunto:</strong> ${this.inquiry.subject}</p>
          <p style="margin: 0;"><strong>Mensagem:</strong> ${this.messageBody.substring(0, 200)}${this.messageBody.length > 200 ? '...' : ''}</p>
        </div>
        <p>Acesse para ver: <a href="${this.actionUrl}">${this.actionUrl}</a></p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Equipe Anua</p>
      </div>
    `)
  }
}
