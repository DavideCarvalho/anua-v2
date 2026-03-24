import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'
import type ParentInquiry from '#models/parent_inquiry'

export default class InquiryCreatedMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')
  subject = 'Nova pergunta de responsavel'

  constructor(
    private recipient: User,
    private inquiry: ParentInquiry,
    private actionUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.recipient.email!)
    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Nova pergunta de responsavel</h2>
        <p>Ola, ${this.recipient.name}.</p>
        <p>Um responsavel enviou uma nova pergunta sobre um aluno.</p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0 0 6px;"><strong>Assunto:</strong> ${this.inquiry.subject}</p>
        </div>
        <p>Acesse para responder: <a href="${this.actionUrl}">${this.actionUrl}</a></p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Equipe Anua</p>
      </div>
    `)
  }
}
