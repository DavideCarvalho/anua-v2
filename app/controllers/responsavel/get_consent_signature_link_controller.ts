import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import AppException from '#exceptions/app_exception'
import { resolveSignatureProvider } from '#services/signature/resolve_signature_provider'

export default class GetConsentSignatureLinkController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth?.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const consent = await EventParentalConsent.query().where('id', params.consentId).first()

    if (!consent) {
      throw AppException.notFound('Autorização não encontrada')
    }

    if (consent.responsibleId !== user.id) {
      throw AppException.forbidden('Você não é o responsável dessa autorização')
    }

    if (!consent.signatureSubmissionId) {
      return response.ok({ signatureLink: null, reason: 'not-started' })
    }
    if (consent.status === 'APPROVED') {
      return response.ok({ signatureLink: null, reason: 'already-signed' })
    }

    const provider = resolveSignatureProvider()
    const doc = await provider.getDocument(consent.signatureSubmissionId)

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

    const link = await provider.createSignatureLink(mySig.publicId)
    return response.ok({ signatureLink: link.signatureLink, reason: null })
  }
}
