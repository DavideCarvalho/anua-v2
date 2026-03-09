import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import User from '#models/user'
import Student from '#models/student'
import Role from '#models/role'
import StudentAddress from '#models/student_address'
import StudentMedicalInfo from '#models/student_medical_info'
import StudentMedication from '#models/student_medication'
import StudentEmergencyContact from '#models/student_emergency_contact'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasAcademicPeriod from '#models/student_has_academic_period'
import StudentHasLevel from '#models/student_has_level'
import IndividualDiscount from '#models/individual_discount'
import AcademicPeriod from '#models/academic_period'
import Class_ from '#models/class'
import Level from '#models/level'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import { enrollStudentValidator } from '#validators/student'
import GenerateStudentPaymentsJob from '#jobs/payments/generate_student_payments_job'
import AppException from '#exceptions/app_exception'
import type { EmergencyContactRelationship } from '#models/student_emergency_contact'
import { normalizeDocumentNumber } from '#lib/normalize_document_number'

export default class EnrollStudentController {
  async handle(ctx: HttpContext) {
    const { request, response, auth, logger } = ctx

    const data = await request.validateUsing(enrollStudentValidator)

    // Helper function to check if a date represents an adult (18+)
    const isAdult = (birthDateStr: string): boolean => {
      const birthDate = DateTime.fromISO(birthDateStr)
      if (!birthDate.isValid) return false
      const today = DateTime.now()
      const age = today.diff(birthDate, 'years').years
      return age >= 18
    }

    // Check if student is adult
    const studentIsAdult = isAdult(data.basicInfo.birthDate)

    // If student is adult, document and phone are required
    if (studentIsAdult) {
      if (!data.basicInfo.documentNumber) {
        throw AppException.badRequest('Documento é obrigatório para maiores de idade')
      }
      if (!data.basicInfo.phone) {
        throw AppException.badRequest('Telefone é obrigatório para maiores de idade')
      }
    }

    // Check if all responsibles are adults
    for (const responsible of data.responsibles) {
      if (!isAdult(responsible.birthDate)) {
        throw AppException.badRequest(`Responsável "${responsible.name}" deve ser maior de idade`)
      }
    }

    // Check for duplicate documents
    const studentDoc = normalizeDocumentNumber(data.basicInfo.documentNumber || '', 'CPF')
    const responsibleDocs = data.responsibles.map((r) =>
      normalizeDocumentNumber(r.documentNumber, r.documentType)
    )

    // Check if student document matches any responsible
    if (studentDoc) {
      const conflictWithResponsible = data.responsibles.find(
        (r) => normalizeDocumentNumber(r.documentNumber, r.documentType) === studentDoc
      )
      if (conflictWithResponsible) {
        throw AppException.badRequest(
          `Documento do aluno não pode ser igual ao do responsável "${conflictWithResponsible.name}"`
        )
      }
    }

    // Check if any responsible documents are duplicated
    const uniqueDocs = new Set(responsibleDocs)
    if (uniqueDocs.size !== responsibleDocs.length) {
      throw AppException.badRequest('Cada responsável deve ter um documento único')
    }

    // Get school from the academic period
    const academicPeriod = await AcademicPeriod.find(data.billing.academicPeriodId)
    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }
    const schoolId = academicPeriod.schoolId

    // Check if email is already in use (if provided)
    const studentEmail = data.basicInfo.email?.trim().toLowerCase()
    if (studentEmail) {
      const existingEmailUser = await User.query()
        .where('email', studentEmail)
        .where('schoolId', schoolId)
        .first()

      if (existingEmailUser) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    // Check for duplicate emails between responsibles in the form
    const responsibleEmails = data.responsibles
      .map((r) => r.email?.trim().toLowerCase())
      .filter(Boolean) as string[]
    const uniqueEmails = new Set(responsibleEmails)
    if (uniqueEmails.size !== responsibleEmails.length) {
      throw AppException.badRequest('Cada responsável deve ter um e-mail único')
    }

    // Check if responsible emails conflict with existing users (different document = conflict)
    for (const responsible of data.responsibles) {
      const respEmail = responsible.email?.trim().toLowerCase()
      if (!respEmail) continue

      const existingUser = await User.query()
        .where('email', respEmail)
        .where('schoolId', schoolId)
        .first()

      if (existingUser) {
        const respDoc = normalizeDocumentNumber(
          responsible.documentNumber || '',
          responsible.documentType
        )
        const existingDoc = existingUser.documentNumber?.replace(/\D/g, '') || ''
        if (!respDoc || !existingDoc || respDoc !== existingDoc) {
          throw AppException.operationFailedWithProvidedData(409)
        }
      }
    }

    // Check if student already exists by document (only if document is provided)
    const existingUser = studentDoc
      ? await User.query().where('documentNumber', studentDoc).where('schoolId', schoolId).first()
      : null

    if (existingUser) {
      // Check if already enrolled in this academic period
      const existingEnrollment = await StudentHasAcademicPeriod.query()
        .where('studentId', existingUser.id)
        .where('academicPeriodId', data.billing.academicPeriodId)
        .first()

      if (existingEnrollment) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    // Get STUDENT role
    const studentRole = await Role.findBy('name', 'STUDENT')
    if (!studentRole) {
      throw AppException.internalServerError('Role STUDENT não encontrada')
    }

    // Get STUDENT_RESPONSIBLE role for creating responsibles
    const responsibleRole = await Role.findBy('name', 'STUDENT_RESPONSIBLE')
    if (!responsibleRole && !data.basicInfo.isSelfResponsible && data.responsibles.length > 0) {
      throw AppException.internalServerError('Role STUDENT_RESPONSIBLE não encontrada')
    }

    const trx = await db.transaction()

    try {
      // 1. Create User for student
      const userId = uuidv7()
      const userSlug = string.slug(data.basicInfo.name, { lower: true }) + '-' + userId.slice(0, 8)

      const user = await User.create(
        {
          id: userId,
          name: data.basicInfo.name,
          slug: userSlug,
          email: studentEmail,
          phone: data.basicInfo.phone || null,
          birthDate: DateTime.fromISO(data.basicInfo.birthDate),
          documentType: data.basicInfo.documentType,
          documentNumber: data.basicInfo.documentNumber || null,
          whatsappContact: data.basicInfo.whatsappContact,
          schoolId: schoolId,
          roleId: studentRole.id,
          active: true,
        },
        { client: trx }
      )

      // 2. Create Student
      const student = await Student.create(
        {
          id: user.id,
          descountPercentage: data.billing.discount ?? 0,
          monthlyPaymentAmount: data.billing.monthlyFee ?? 0,
          isSelfResponsible: data.basicInfo.isSelfResponsible,
          paymentDate: data.billing.paymentDate ?? 5,
          classId: data.billing.classId || null,
          contractId: data.billing.contractId || null,
          balance: 0,
          enrollmentStatus: 'REGISTERED',
        },
        { client: trx }
      )

      // 3. Create/Link Responsibles
      const responsibleUserIds: string[] = []
      if (!data.basicInfo.isSelfResponsible && data.responsibles.length > 0) {
        for (const respData of data.responsibles) {
          let responsibleUser: User

          // Check if responsible already exists
          const normalizedResponsibleDocument = normalizeDocumentNumber(
            respData.documentNumber,
            respData.documentType
          )

          const existingResponsible = await User.query({ client: trx })
            .where('documentNumber', normalizedResponsibleDocument)
            .first()

          if (existingResponsible) {
            responsibleUser = existingResponsible
            // Update email only if user hasn't verified theirs yet
            if (!existingResponsible.emailVerifiedAt && respData.email) {
              existingResponsible.email = respData.email.trim().toLowerCase()
              await existingResponsible.useTransaction(trx).save()
            }
          } else {
            // Create new responsible user
            const respId = uuidv7()
            const respSlug = string.slug(respData.name, { lower: true }) + '-' + respId.slice(0, 8)

            responsibleUser = await User.create(
              {
                id: respId,
                name: respData.name,
                slug: respSlug,
                email: respData.email?.trim().toLowerCase() || null,
                phone: respData.phone,
                birthDate: DateTime.fromISO(respData.birthDate),
                documentType: respData.documentType,
                documentNumber: normalizedResponsibleDocument,
                schoolId: schoolId,
                roleId: responsibleRole!.id,
                active: true,
              },
              { client: trx }
            )
          }

          responsibleUserIds.push(responsibleUser.id)

          // Link responsible to student
          await StudentHasResponsible.create(
            {
              id: uuidv7(),
              studentId: student.id,
              responsibleId: responsibleUser.id,
              isPedagogical: respData.isPedagogical,
              isFinancial: respData.isFinancial,
            },
            { client: trx }
          )
        }
      }

      // 4. Create Student Address
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
        },
        { client: trx }
      )

      // 5. Create Medical Info
      const medicalInfo = await StudentMedicalInfo.create(
        {
          id: uuidv7(),
          studentId: student.id,
          conditions: data.medicalInfo.conditions || null,
        },
        { client: trx }
      )

      // 6. Create Medications
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

      // 7. Create Emergency Contacts
      for (const contact of data.medicalInfo.emergencyContacts) {
        const contactUserId =
          typeof contact.responsibleIndex === 'number'
            ? (responsibleUserIds[contact.responsibleIndex] ?? null)
            : null
        await StudentEmergencyContact.create(
          {
            id: uuidv7(),
            studentId: student.id,
            userId: contactUserId,
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship as EmergencyContactRelationship,
            order: contact.order,
          },
          { client: trx }
        )
      }

      // 8. Create Academic Period enrollment
      await StudentHasAcademicPeriod.create(
        {
          studentId: student.id,
          academicPeriodId: data.billing.academicPeriodId,
          classId: data.billing.classId || null,
        },
        { client: trx }
      )

      // 9. Create StudentHasLevel (for proper enrollment tracking)
      let createdStudentHasLevelId: string | null = null

      if (data.billing.classId) {
        // Get the class to find its levelId
        const classRecord = await Class_.find(data.billing.classId)
        if (classRecord?.levelId) {
          // Find the LevelAssignedToCourseHasAcademicPeriod for this level and academic period
          const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.query({
            client: trx,
          })
            .where('levelId', classRecord.levelId)
            .whereHas('courseHasAcademicPeriod', (query) => {
              query.where('academicPeriodId', data.billing.academicPeriodId)
            })
            .first()

          if (levelAssignment) {
            // Get the Level's default contractId as fallback
            const level = await Level.find(classRecord.levelId)
            const contractId = data.billing.contractId || level?.contractId || null
            const hasIndividualDiscounts =
              !!data.billing.individualDiscounts && data.billing.individualDiscounts.length > 0

            const studentHasLevel = await StudentHasLevel.create(
              {
                studentId: student.id,
                levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
                academicPeriodId: data.billing.academicPeriodId,
                levelId: classRecord.levelId,
                classId: data.billing.classId,
                contractId,
                scholarshipId: hasIndividualDiscounts ? null : data.billing.scholarshipId || null,
                paymentMethod: data.billing.paymentMethod || null,
                installments: data.billing.installments || null,
                enrollmentInstallments: data.billing.enrollmentInstallments || null,
                paymentDay: data.billing.paymentDate || null,
              },
              { client: trx }
            )
            createdStudentHasLevelId = studentHasLevel.id

            // Create individual discounts if provided
            if (data.billing.individualDiscounts && data.billing.individualDiscounts.length > 0) {
              for (const discountData of data.billing.individualDiscounts) {
                await IndividualDiscount.create(
                  {
                    id: uuidv7(),
                    name: discountData.name,
                    description: discountData.description || null,
                    discountType: discountData.discountType,
                    discountPercentage:
                      discountData.discountType === 'PERCENTAGE'
                        ? (discountData.discountPercentage ?? 0)
                        : null,
                    enrollmentDiscountPercentage:
                      discountData.discountType === 'PERCENTAGE'
                        ? (discountData.enrollmentDiscountPercentage ?? 0)
                        : null,
                    discountValue:
                      discountData.discountType === 'FLAT'
                        ? (discountData.discountValue ?? 0)
                        : null,
                    enrollmentDiscountValue:
                      discountData.discountType === 'FLAT'
                        ? (discountData.enrollmentDiscountValue ?? 0)
                        : null,
                    isActive: true,
                    schoolId: schoolId,
                    studentId: student.id,
                    studentHasLevelId: studentHasLevel.id,
                    createdById: auth.user!.id,
                  },
                  { client: trx }
                )
              }
            }
          }
        }
      }

      await trx.commit()

      // Dispatch payment generation job after successful enrollment
      // Job will check for contract (own or from level) and skip if none
      if (createdStudentHasLevelId) {
        try {
          await GenerateStudentPaymentsJob.dispatch({
            studentHasLevelId: createdStudentHasLevelId,
          })
          logger.info(
            { studentHasLevelId: createdStudentHasLevelId },
            '[ENROLL] Dispatched payment generation job'
          )
        } catch (jobError) {
          // Log error but don't fail enrollment
          logger.error({ error: jobError }, '[ENROLL] Failed to dispatch payment job')
        }
      }

      // Load student with relationships
      const enrolledStudent = await Student.query()
        .where('id', student.id)
        .preload('user')
        .preload('address')
        .preload('responsibles', (query) => {
          query.preload('responsible')
        })
        .firstOrFail()

      return response.created({
        message: 'Aluno matriculado com sucesso',
        student: enrolledStudent,
      })
    } catch (error) {
      await trx.rollback()
      logger.error({ error }, 'Error enrolling student')
      throw error
    }
  }
}
