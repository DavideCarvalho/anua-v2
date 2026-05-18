import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import db from '@adonisjs/lucid/services/db'
import { v7 as uuidv7 } from 'uuid'
import { DateTime } from 'luxon'

import User from '#models/user'
import Student from '#models/student'
import StudentAddress from '#models/student_address'
import StudentMedicalInfo from '#models/student_medical_info'
import StudentMedication from '#models/student_medication'
import StudentEmergencyContact from '#models/student_emergency_contact'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentDocumentSubmission from '#models/student_document_submission'
import AcademicPeriod from '#models/academic_period'
import Contract from '#models/contract'
import ContractDocument from '#models/contract_document'
import Scholarship from '#models/scholarship'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Role from '#models/role'

import { finishEnrollmentValidator } from '#validators/enrollment'
import { createVerificationCode } from '#services/otp_service'
import OtpCodeMail from '#mails/otp_code_mail'
import { notificationService } from '#services/notification_service'
import AppException from '#exceptions/app_exception'

type AcademicPeriodSegment =
  | 'KINDERGARTEN'
  | 'ELEMENTARY'
  | 'HIGHSCHOOL'
  | 'TECHNICAL'
  | 'UNIVERSITY'
  | 'OTHER'

const BASIC_EDUCATION_SEGMENTS: AcademicPeriodSegment[] = [
  'KINDERGARTEN',
  'ELEMENTARY',
  'HIGHSCHOOL',
]

function calculateAge(birthDate: DateTime, now: DateTime): number {
  return Math.floor(now.diff(birthDate, 'years').years)
}

/**
 * Aluno Autorresponsável só é permitido quando:
 *   - aluno >= 18 anos E
 *   - segmento do período NÃO é Educação Básica
 * (ver CONTEXT.md → Aluno Autorresponsável)
 */
function selfResponsibleAllowed(segment: AcademicPeriodSegment, ageYears: number): boolean {
  if (BASIC_EDUCATION_SEGMENTS.includes(segment)) return false
  return ageYears >= 18
}

export default class FinishEnrollmentController {
  async handle({ request, response, logger }: HttpContext) {
    const data = await request.validateUsing(finishEnrollmentValidator)

    // --- Pré-validações fora da transaction ---

    const academicPeriod = await AcademicPeriod.find(data.academicPeriodId)
    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Janela de matrícula (era furo: existia em get_school_enrollment_info mas
    // alguém com IDs válidos conseguia POSTar mesmo fora da janela)
    const now = new Date()
    if (academicPeriod.enrollmentStartDate && academicPeriod.enrollmentStartDate.toJSDate() > now) {
      throw AppException.badRequest('Matrículas ainda não foram abertas para este período')
    }
    if (academicPeriod.enrollmentEndDate && academicPeriod.enrollmentEndDate.toJSDate() < now) {
      throw AppException.badRequest('Matrículas encerradas para este período')
    }

    // Regra Aluno Autorresponsável (ver CONTEXT.md)
    const studentBirthDate = DateTime.fromISO(data.student.birthDate)
    if (!studentBirthDate.isValid) {
      throw AppException.badRequest('Data de nascimento do aluno inválida')
    }
    const studentAge = calculateAge(studentBirthDate, DateTime.now())

    if (data.student.isSelfResponsible) {
      if (!selfResponsibleAllowed(academicPeriod.segment, studentAge)) {
        throw AppException.badRequest(
          'Aluno só pode ser autorresponsável quando é maior de 18 anos e o segmento não é educação básica'
        )
      }
    } else {
      if (data.responsibles.length === 0) {
        throw AppException.badRequest('Pelo menos um responsável é obrigatório')
      }
    }

    // Roles obrigatórias pra User.roleId (NOT NULL no schema)
    const studentRole = await Role.findBy('name', 'STUDENT')
    if (!studentRole) {
      throw AppException.internalServerError('Role STUDENT não encontrada')
    }
    const responsibleRole = await Role.findBy('name', 'STUDENT_RESPONSIBLE')
    if (!responsibleRole && !data.student.isSelfResponsible && data.responsibles.length > 0) {
      throw AppException.internalServerError('Role STUDENT_RESPONSIBLE não encontrada')
    }

    // Resolve a tripla level+course+academicPeriod → row de assignment.
    // StudentHasLevel.levelAssignedToCourseAcademicPeriodId é FK obrigatória,
    // não dá pra inventar UUID novo.
    const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.query()
      .where('levelId', data.levelId)
      .whereHas('courseHasAcademicPeriod', (q) => {
        q.where('courseId', data.courseId).where('academicPeriodId', data.academicPeriodId)
      })
      .first()
    if (!levelAssignment) {
      throw AppException.badRequest(
        'Nível não está vinculado a esse curso/período — contate a secretaria'
      )
    }

    // Determina contrato efetivo (pra placeholders de documento)
    const contract = data.contractId ? await Contract.find(data.contractId) : null
    const requiredDocuments = contract
      ? await ContractDocument.query().where('contractId', contract.id)
      : []

    // --- Transação principal ---

    const trx = await db.transaction()

    try {
      // 1. Cria/atualiza user do aluno
      let studentUser = await User.query({ client: trx })
        .where('documentNumber', data.student.document)
        .orWhere('email', data.student.email)
        .first()

      if (!studentUser) {
        studentUser = await User.create(
          {
            id: uuidv7(),
            name: data.student.name,
            slug: data.student.email?.split('@')[0] || uuidv7().slice(0, 8),
            email: data.student.email,
            phone: data.student.phone || null,
            documentNumber: data.student.document,
            documentType: data.student.documentType,
            birthDate: studentBirthDate,
            active: true,
            whatsappContact: false,
            grossSalary: 0,
            schoolId: data.schoolId,
            roleId: studentRole.id,
          },
          { client: trx }
        )
      }

      // 2. Cria registro de Student
      let student = await Student.find(studentUser.id, { client: trx })
      if (!student) {
        student = await Student.create(
          {
            id: studentUser.id,
            descountPercentage: 0,
            monthlyPaymentAmount: 0,
            isSelfResponsible: data.student.isSelfResponsible,
            balance: 0,
            enrollmentStatus: 'PENDING_DOCUMENT_REVIEW',
            contractId: data.contractId ?? null,
          },
          { client: trx }
        )
      }

      // 3. Vincula aluno à escola (UserHasSchool)
      const existingSchoolLink = await trx
        .query()
        .from('UserHasSchool')
        .where('userId', studentUser.id)
        .where('schoolId', data.schoolId)
        .first()

      if (!existingSchoolLink) {
        await trx.insertQuery().table('UserHasSchool').insert({
          id: uuidv7(),
          userId: studentUser.id,
          schoolId: data.schoolId,
          createdAt: DateTime.now().toSQL(),
          updatedAt: DateTime.now().toSQL(),
        })
      }

      // 4. Resolve bolsa (se código informado)
      let scholarshipId: string | null = null
      if (data.billing?.scholarshipCode) {
        const scholarship = await Scholarship.query({ client: trx })
          .where('code', data.billing.scholarshipCode)
          .where('schoolId', data.schoolId)
          .where('active', true)
          .first()
        if (scholarship) {
          scholarshipId = scholarship.id
        }
      }

      // 5. Cria StudentHasLevel (a Matrícula em si). Quando a escola não tem
      // pgto online configurado, billing vem undefined — os campos ficam nulos
      // e a escola entra em contato pra combinar a forma de pagamento.
      const studentHasLevel = await StudentHasLevel.create(
        {
          studentId: student.id,
          levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
          academicPeriodId: data.academicPeriodId,
          levelId: data.levelId,
          contractId: data.contractId || null,
          scholarshipId,
          paymentMethod: data.billing?.paymentMethod ?? null,
          paymentDay: data.billing?.paymentDay ?? null,
          enrollmentInstallments: data.billing?.enrollmentInstallments ?? 1,
          installments: data.billing?.installments ?? 12,
        },
        { client: trx }
      )

      // 6. Endereço
      await StudentAddress.create(
        {
          id: uuidv7(),
          studentId: student.id,
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement || null,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          latitude: data.address.latitude || null,
          longitude: data.address.longitude || null,
        },
        { client: trx }
      )

      // 7. Info médica (opcional)
      if (data.medicalInfo) {
        const medicalInfo = await StudentMedicalInfo.create(
          {
            id: uuidv7(),
            studentId: student.id,
            conditions: data.medicalInfo.conditions || null,
          },
          { client: trx }
        )

        if (data.medicalInfo.medications && data.medicalInfo.medications.length > 0) {
          for (const med of data.medicalInfo.medications) {
            await StudentMedication.create(
              {
                id: uuidv7(),
                medicalInfoId: medicalInfo.id,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                instructions: med.instructions || null,
              },
              { client: trx }
            )
          }
        }
      }

      // 8. Responsáveis
      const responsibleUserIds: string[] = []
      const responsibleUsers: { id: string; email: string; isPedagogical: boolean }[] = []
      for (const responsible of data.responsibles) {
        let responsibleUser = await User.query({ client: trx })
          .where('documentNumber', responsible.document)
          .orWhere('email', responsible.email)
          .first()

        if (!responsibleUser) {
          responsibleUser = await User.create(
            {
              id: uuidv7(),
              name: responsible.name,
              slug: responsible.email?.split('@')[0] || uuidv7().slice(0, 8),
              email: responsible.email,
              phone: responsible.phone,
              documentNumber: responsible.document,
              documentType: responsible.documentType,
              birthDate: responsible.birthDate ? DateTime.fromISO(responsible.birthDate) : null,
              active: true,
              whatsappContact: false,
              grossSalary: 0,
              schoolId: data.schoolId,
              roleId: responsibleRole!.id,
            },
            { client: trx }
          )

          const existingLink = await trx
            .query()
            .from('UserHasSchool')
            .where('userId', responsibleUser.id)
            .where('schoolId', data.schoolId)
            .first()

          if (!existingLink) {
            await trx.insertQuery().table('UserHasSchool').insert({
              id: uuidv7(),
              userId: responsibleUser.id,
              schoolId: data.schoolId,
              createdAt: DateTime.now().toSQL(),
              updatedAt: DateTime.now().toSQL(),
            })
          }
        }

        responsibleUserIds.push(responsibleUser.id)
        responsibleUsers.push({
          id: responsibleUser.id,
          email: responsibleUser.email!,
          isPedagogical: responsible.isPedagogical,
        })

        await StudentHasResponsible.create(
          {
            id: uuidv7(),
            studentId: student.id,
            responsibleId: responsibleUser.id,
            isPedagogical: responsible.isPedagogical,
            isFinancial: responsible.isFinancial,
          },
          { client: trx }
        )
      }

      // 9. Contatos de emergência
      for (let i = 0; i < data.emergencyContacts.length; i++) {
        const contact = data.emergencyContacts[i]
        const userId =
          typeof contact.responsibleIndex === 'number'
            ? (responsibleUserIds[contact.responsibleIndex] ?? null)
            : null
        await StudentEmergencyContact.create(
          {
            id: uuidv7(),
            studentId: student.id,
            userId,
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            order: i,
          },
          { client: trx }
        )
      }

      // 10. Placeholders de Submission pra cada documento contratual requerido.
      // O eixo Documentação fica visível desde o início ("0 de N enviados").
      // Ver ADR-0001 e a pergunta 10.1 do grilling.
      for (const cd of requiredDocuments) {
        const existing = await StudentDocumentSubmission.query({ client: trx })
          .where('studentId', student.id)
          .where('contractDocumentId', cd.id)
          .first()
        if (!existing) {
          await StudentDocumentSubmission.create(
            {
              studentId: student.id,
              contractDocumentId: cd.id,
              status: 'PENDING',
            },
            { client: trx }
          )
        }
      }

      await trx.commit()

      // --- Pós-commit: OTP síncrono + futuro enqueue de jobs (Wave 5) ---

      // Escolhe o destinatário do OTP: primeiro responsável pedagógico,
      // senão primeiro responsável qualquer, senão o próprio aluno autorresponsável.
      const otpRecipient = data.student.isSelfResponsible
        ? { email: data.student.email, kind: 'student' as const }
        : (() => {
            const pedagogical = responsibleUsers.find((r) => r.isPedagogical)
            const first = responsibleUsers[0]
            const chosen = pedagogical || first
            return chosen ? { email: chosen.email, kind: 'responsible' as const } : null
          })()

      if (otpRecipient) {
        try {
          const code = await createVerificationCode(otpRecipient.email)
          await mail.send(new OtpCodeMail(otpRecipient.email, code))
        } catch (err) {
          logger.error(
            { err, email: otpRecipient.email },
            '[finish_enrollment] falha ao enviar OTP — matrícula criada, mas responsável não recebeu código'
          )
          // Não joga erro pro cliente: a matrícula foi criada com sucesso,
          // o responsável pode pedir o código de novo via /auth/send-code.
        }
      }

      // Evento 1 — matrícula iniciada — pra todos os responsáveis (ou aluno autorresponsável)
      const notificationRecipientIds = data.student.isSelfResponsible
        ? [student.id]
        : responsibleUserIds
      for (const uid of notificationRecipientIds) {
        notificationService
          .send({
            userId: uid,
            type: 'ENROLLMENT_STARTED',
            title: 'Matrícula recebida',
            message:
              'Sua matrícula foi iniciada. Acesse o portal pra enviar documentos e acompanhar.',
            actionUrl: `/responsavel/matricula/${studentHasLevel.id}`,
            data: { studentHasLevelId: studentHasLevel.id, studentId: student.id },
          })
          .catch((err) => {
            logger.error(
              { err, userId: uid },
              '[finish_enrollment] falhou ao enviar notificação ENROLLMENT_STARTED'
            )
          })
      }

      // TODO (signature provider, ADR-0002): quando provider escolhido,
      // enfileirar CreateSignatureSubmissionJob aqui.
      // TODO: NotifySchoolStaffJob (notifica secretaria) — depende de modelo
      // pra "usuários administrativos da escola" que recebem dispatches operacionais.

      return response.created({
        success: true,
        studentId: student.id,
        studentHasLevelId: studentHasLevel.id,
        otpSentTo: otpRecipient ? otpRecipient.email.replace(/^(.{2}).+(@.+)$/, '$1***$2') : null,
        redirectTo: `/auth/verify?next=/responsavel/matricula/${studentHasLevel.id}`,
        message: 'Matrícula iniciada! Enviamos um código de acesso pro e-mail do responsável.',
      })
    } catch (error) {
      await trx.rollback()
      logger.error({ error }, '[finish_enrollment] erro ao processar matrícula')
      throw AppException.internalServerError(
        'Erro ao processar matrícula. Por favor, tente novamente.'
      )
    }
  }
}
