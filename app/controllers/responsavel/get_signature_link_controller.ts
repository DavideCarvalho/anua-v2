import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import AppException from '#exceptions/app_exception'
import { resolveSignatureProvider } from '#services/signature/resolve_signature_provider'

export default class GetSignatureLinkController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth?.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const shl = await StudentHasLevel.query()
      .where('id', params.matriculaId)
      .preload('student', (q) => {
        q.preload('responsibles', (rq) => {
          rq.preload('responsible')
        })
      })
      .first()

    if (!shl) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    const isResponsible = shl.student.responsibles.some((r) => r.responsibleId === user.id)
    if (!isResponsible) {
      throw AppException.forbidden('Você não é responsável por essa matrícula')
    }

    if (!shl.signatureSubmissionId) {
      return response.ok({ signatureLink: null, reason: 'not-started' })
    }
    if (shl.signatureStatus === 'SIGNED') {
      return response.ok({ signatureLink: null, reason: 'already-signed' })
    }

    const provider = resolveSignatureProvider()
    const doc = await provider.getDocument(shl.signatureSubmissionId)

    // Acha a assinatura correspondente ao e-mail do responsável logado.
    // Fallback: primeira assinatura pendente do documento.
    const mySig =
      doc.signatures.find((s) => s.email && user.email && s.email === user.email) ??
      doc.signatures.find((s) => !s.signedAt) ??
      doc.signatures[0]

    if (!mySig) {
      return response.ok({ signatureLink: null, reason: 'no-signature-found' })
    }

    if (mySig.signatureLink) {
      return response.ok({ signatureLink: mySig.signatureLink, reason: null })
    }

    // Se o link não veio embutido (depende do plano Autentique),
    // gera sob demanda via createSignatureLink.
    const link = await provider.createSignatureLink(mySig.publicId)
    return response.ok({ signatureLink: link.signatureLink, reason: null })
  }
}
