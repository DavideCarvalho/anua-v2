import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import StudentHasLevel from '#models/student_has_level'
import { resolveSignatureProvider } from '#services/signature/resolve_signature_provider'

export default class TestSignatureLink extends BaseCommand {
  static commandName = 'test:signature-link'
  static description = 'Testa o controller GetSignatureLink chamando o provider diretamente'

  static options: CommandOptions = { startApp: true }

  async run() {
    const SHL_ID = '019e377c-83b6-72da-8571-3c68023f6b67'

    // 1. Reverter pra PENDING
    const shl = await StudentHasLevel.query()
      .where('id', SHL_ID)
      .preload('student', (q) => {
        q.preload('responsibles', (rq) => {
          rq.where('isFinancial', true).preload('responsible')
        })
      })
      .firstOrFail()

    if (shl.signatureStatus !== 'PENDING') {
      this.logger.info(`Revertendo signatureStatus de ${shl.signatureStatus} → PENDING`)
      shl.signatureStatus = 'PENDING'
      shl.documentSignedAt = null
      await shl.save()
    }

    if (!shl.signatureSubmissionId) {
      this.logger.error(
        'Matrícula não tem signatureSubmissionId — rode test:signature-flow primeiro'
      )
      return
    }

    // 2. Simular a lógica do controller — pra cada responsável, busca o link
    const provider = resolveSignatureProvider()
    const doc = await provider.getDocument(shl.signatureSubmissionId)

    this.logger.info(`\nDocumento Autentique: ${doc.documentId}`)
    this.logger.info(`Status: ${doc.status}`)
    this.logger.info(`Total signers: ${doc.signatures.length}`)

    for (const responsibleRel of shl.student.responsibles) {
      const user = responsibleRel.responsible
      if (!user) continue

      this.logger.info(`\n--- Testando como responsável: ${user.name} (${user.email}) ---`)

      const mySig =
        doc.signatures.find((s) => s.email && user.email && s.email === user.email) ??
        doc.signatures.find((s) => !s.signedAt) ??
        doc.signatures[0]

      if (!mySig) {
        this.logger.info('  → nenhum signature encontrado')
        continue
      }

      this.logger.info(`  Signature match: ${mySig.email} | publicId: ${mySig.publicId}`)

      let link = mySig.signatureLink
      if (!link) {
        this.logger.info('  Link não veio embutido — chamando createSignatureLink...')
        const r = await provider.createSignatureLink(mySig.publicId)
        link = r.signatureLink
      }
      this.logger.success(`  Link de assinatura: ${link}`)
    }

    this.logger.info('\n--- Status final do StudentHasLevel ---')
    await shl.refresh()
    console.log(
      JSON.stringify(
        {
          id: shl.id,
          signatureStatus: shl.signatureStatus,
          signatureSubmissionId: shl.signatureSubmissionId,
        },
        null,
        2
      )
    )
  }
}
