import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import type User from '#models/user'

interface ChangelogSection {
  title: string
  items: string[]
}

export default class ChangelogDigestMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')

  constructor(
    private recipient: User,
    private sections: ChangelogSection[]
  ) {
    super()
    this.subject = sections[0]?.title ?? 'Novidades do Anuá'
  }

  prepare() {
    this.message.to(this.recipient.email!)

    const contentHtml = this.sections
      .map((section) =>
        section.items
          .map(
            (item) =>
              `<p style="margin: 8px 0; color: #374151; white-space: pre-line;">${item}</p>`
          )
          .join('')
      )
      .join('')

    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7038bd; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">Novidades do Anuá</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
          ${contentHtml}
          <div style="margin-top: 24px; text-align: center;">
            <a href="${env.get('APP_URL', 'https://app.anua.com.br')}" style="display: inline-block; background-color: #7038bd; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Acessar o Anuá
            </a>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
            Voce recebeu este email porque usa o Anuá.
          </p>
        </div>
      </div>
    `)
  }
}
