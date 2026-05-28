import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { readFile } from 'node:fs/promises'
import drive from '@adonisjs/drive/services/main'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import { generateSignaturePdf } from '#services/signature/signature_pdf_generator'
import {
  startEnrollmentSignature,
  applySignatureWebhook,
} from '#services/signature/enrollment_signature_service'
import { resolveSignatureProvider } from '#services/signature/resolve_signature_provider'

const CONTRACT_ID = '019ff000-0000-7000-0000-000000000001'
const PDF_PATH = '/home/dudousxd/personal/anua-v2/contrato-escola-teste.pdf'

export default class TestSignatureFlow extends BaseCommand {
  static commandName = 'test:signature-flow'
  static description = 'Testa o fluxo de assinatura end-to-end (1 contrato, 1 matrícula, Autentique sandbox)'

  static options: CommandOptions = { startApp: true }

  async run() {
    const log = (label: string, payload: unknown) => {
      this.logger.info(`\n=== ${label} ===`)
      console.log(JSON.stringify(payload, null, 2))
    }

    // 1. Garantir template no contrato
    this.logger.info('Step 1: configurando template no Contract...')
    const contract = await Contract.findOrFail(CONTRACT_ID)
    if (!contract.signatureTemplatePdfKey || !contract.signatureTemplateSchemas) {
      const pdfBuffer = await readFile(PDF_PATH)
      const key = `contracts/${CONTRACT_ID}/signature-template-test.pdf`
      await drive.use().put(key, pdfBuffer, { contentType: 'application/pdf' })

      contract.signatureTemplatePdfKey = key
      contract.signatureTemplateSchemas = [
        [
          {
            name: 'Assinatura 1',
            type: 'signature',
            position: { x: 25, y: 188 },
            width: 43,
            height: 16,
          },
          {
            name: 'Data 1',
            type: 'date',
            format: 'dd/MM/yyyy',
            position: { x: 100, y: 152 },
            width: 30,
            height: 8,
            locale: 'pt-Br',
          },
        ],
      ]
      await contract.save()
      this.logger.info('  → template configurado')
    } else {
      this.logger.info('  → template já existe, reusando')
    }

    // 2. Gerar PDF preenchido
    this.logger.info('\nStep 2: gerando PDF via @pdfme/generator...')
    const pdfFilled = await generateSignaturePdf({
      pdfKey: contract.signatureTemplatePdfKey!,
      schemas: contract.signatureTemplateSchemas!,
    })
    this.logger.info(`  → PDF gerado: ${pdfFilled.length} bytes`)

    // 3. Buscar matrícula real
    this.logger.info('\nStep 3: buscando matrícula com responsável financeiro com email...')
    const shl = await StudentHasLevel.query()
      .whereNull('deletedAt')
      .whereNull('signatureSubmissionId')
      .preload('student', (q) => {
        q.preload('responsibles', (rq) => {
          rq.where('isFinancial', true).preload('responsible')
        })
        q.preload('user')
      })
      .whereHas('student', (sq) => {
        sq.whereHas('responsibles', (rq) => {
          rq.where('isFinancial', true).whereHas('responsible', (uq) => {
            uq.whereNotNull('email')
          })
        })
      })
      .first()

    if (!shl) {
      this.logger.error('  → nenhuma matrícula elegível encontrada')
      return
    }

    this.logger.info(
      `  → matrícula ${shl.id} | aluno ${shl.student.user?.name} | resp ${shl.student.responsibles.length}`
    )

    if (shl.contractId !== CONTRACT_ID) {
      this.logger.info(`  → vinculando matrícula ao contrato ${CONTRACT_ID}`)
      shl.contractId = CONTRACT_ID
      await shl.save()
    }

    // 4. startEnrollmentSignature
    this.logger.info('\nStep 4: chamando startEnrollmentSignature...')
    const outcome = await startEnrollmentSignature(shl.id)
    log('outcome', outcome)

    if (outcome.status !== 'STARTED') {
      this.logger.error('Fluxo não chegou a STARTED — parando')
      return
    }

    // 5. Verificar persistência
    this.logger.info('\nStep 5: verificando persistência no StudentHasLevel...')
    await shl.refresh()
    log('shl signature fields', {
      signatureSubmissionId: shl.signatureSubmissionId,
      signatureStatus: shl.signatureStatus,
    })

    // 6. getDocument
    this.logger.info('\nStep 6: getDocument no Autentique...')
    const provider = resolveSignatureProvider()
    const doc = await provider.getDocument(outcome.submissionId)
    log('document', {
      documentId: doc.documentId,
      status: doc.status,
      signatures: doc.signatures.map((s) => ({
        name: s.name,
        email: s.email,
        signedAt: s.signedAt,
        hasLink: !!s.signatureLink,
        link: s.signatureLink,
      })),
    })

    // 7. Simular webhook SIGNED
    this.logger.info('\nStep 7: simulando webhook SIGNED...')
    const result = await applySignatureWebhook(outcome.submissionId, 'SIGNED')
    log('webhook result', result)

    await shl.refresh()
    log('shl após webhook', {
      signatureStatus: shl.signatureStatus,
      documentSignedAt: shl.documentSignedAt?.toISO() ?? null,
    })

    this.logger.success('\n✓ Teste concluído')
  }
}
