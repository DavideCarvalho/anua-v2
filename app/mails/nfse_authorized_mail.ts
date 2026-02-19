import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

interface NfseAuthorizedMailProps {
  to: string
  responsibleName: string
  studentName: string
  monthYear: string
  totalFormatted: string
  nfseNumber: string
  nfsePdfUrl: string
}

export default class NfseAuthorizedMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')
  subject: string

  constructor(private props: NfseAuthorizedMailProps) {
    super()
    this.subject = `NFS-e emitida - ${props.monthYear}`
  }

  prepare() {
    this.message.to(this.props.to)
    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">NFS-e emitida</h2>
        <p>Ola, ${this.props.responsibleName}.</p>
        <p>A Nota Fiscal de Servico Eletronica (NFS-e) referente a fatura de <strong>${this.props.studentName}</strong> foi emitida com sucesso.</p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0 0 6px;"><strong>Aluno:</strong> ${this.props.studentName}</p>
          <p style="margin: 0 0 6px;"><strong>Referencia:</strong> ${this.props.monthYear}</p>
          <p style="margin: 0 0 6px;"><strong>Valor:</strong> ${this.props.totalFormatted}</p>
          <p style="margin: 0;"><strong>Numero da NFS-e:</strong> ${this.props.nfseNumber}</p>
        </div>
        <p>
          <a href="${this.props.nfsePdfUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Baixar NFS-e (PDF)
          </a>
        </p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Equipe Anua</p>
      </div>
    `)
  }
}
