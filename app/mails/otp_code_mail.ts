import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export default class OtpCodeMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')
  subject = 'Seu código de acesso - Anuá'

  constructor(
    private email: string,
    private code: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.email)
    this.message.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Acesso - Anuá</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f3ff;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="display: inline-flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 24px;">✨</span>
                        </div>
                        <span style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Anuá</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Card -->
                  <tr>
                    <td>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.15);">
                        <tr>
                          <td style="padding: 48px 40px; text-align: center;">
                            <!-- Icon -->
                            <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #eef2ff, #f3e8ff); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                              <span style="font-size: 40px;">🔐</span>
                            </div>

                            <!-- Title -->
                            <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #1f2937;">
                              Seu código de acesso
                            </h1>

                            <!-- Subtitle -->
                            <p style="margin: 0 0 32px; font-size: 16px; color: #6b7280; line-height: 1.6;">
                              Use o código abaixo para entrar no Anuá. Ele expira em 10 minutos.
                            </p>

                            <!-- Code -->
                            <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                              <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #6366f1;">
                                ${this.code}
                              </span>
                            </div>

                            <!-- Warning -->
                            <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                              Se você não solicitou este código, pode ignorar este email com segurança.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                        © ${new Date().getFullYear()} Anuá. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `)
  }
}
