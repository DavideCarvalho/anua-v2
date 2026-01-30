import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Student from '#models/student'
import StudentAddress from '#models/student_address'
import StudentMedicalInfo from '#models/student_medical_info'
import StudentMedication from '#models/student_medication'
import StudentEmergencyContact from '#models/student_emergency_contact'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import Scholarship from '#models/scholarship'
import db from '@adonisjs/lucid/services/db'
import { finishEnrollmentValidator } from '#validators/enrollment'
import { v7 as uuidv7 } from 'uuid'
import { DateTime } from 'luxon'

export default class FinishEnrollmentController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(finishEnrollmentValidator)

    const trx = await db.transaction()

    try {
      // 1. Create or find student user
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
            birthDate: data.student.birthDate ? DateTime.fromISO(data.student.birthDate) : null,
            active: true,
            whatsappContact: false,
            grossSalary: 0,
          },
          { client: trx }
        )
      }

      // 2. Create student record
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
          },
          { client: trx }
        )
      }

      // 3. Link student to school (ignore if already exists)
      const existingSchoolLink = await trx
        .query()
        .from('"UserHasSchool"')
        .where('"userId"', studentUser.id)
        .where('"schoolId"', data.schoolId)
        .first()

      if (!existingSchoolLink) {
        await trx.insertQuery().table('"UserHasSchool"').insert({
          id: uuidv7(),
          userId: studentUser.id,
          schoolId: data.schoolId,
          createdAt: DateTime.now().toSQL(),
          updatedAt: DateTime.now().toSQL(),
        })
      }

      // 4. Handle scholarship
      let scholarshipId: string | null = null
      if (data.billing.scholarshipCode) {
        const scholarship = await Scholarship.query({ client: trx })
          .where('code', data.billing.scholarshipCode)
          .where('schoolId', data.schoolId)
          .where('active', true)
          .first()

        if (scholarship) {
          scholarshipId = scholarship.id
        }
      }

      // 5. Create enrollment (StudentHasLevel)
      await StudentHasLevel.create(
        {
          studentId: student.id,
          levelAssignedToCourseAcademicPeriodId: uuidv7(), // Would need proper lookup
          academicPeriodId: data.academicPeriodId,
          levelId: data.levelId,
          contractId: data.contractId || null,
          scholarshipId,
          paymentMethod: data.billing.paymentMethod,
          paymentDay: data.billing.paymentDay || null,
          enrollmentInstallments: data.billing.enrollmentInstallments || 1,
          installments: data.billing.installments || 12,
        },
        { client: trx }
      )

      // 6. Create student address
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

      // 7. Create medical info if provided
      if (data.medicalInfo) {
        const medicalInfo = await StudentMedicalInfo.create(
          {
            id: uuidv7(),
            studentId: student.id,
            conditions: data.medicalInfo.conditions || null,
          },
          { client: trx }
        )

        // Create medications
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

      // 8. Create/link responsibles (guardians)
      const responsibleUserIds: string[] = []
      for (const responsible of data.responsibles) {
        // Find or create responsible user
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
            },
            { client: trx }
          )

          // Link responsible to school (ignore if already exists)
          const existingLink = await trx
            .query()
            .from('"UserHasSchool"')
            .where('"userId"', responsibleUser.id)
            .where('"schoolId"', data.schoolId)
            .first()

          if (!existingLink) {
            await trx.insertQuery().table('"UserHasSchool"').insert({
              id: uuidv7(),
              userId: responsibleUser.id,
              schoolId: data.schoolId,
              createdAt: DateTime.now().toSQL(),
              updatedAt: DateTime.now().toSQL(),
            })
          }
        }

        responsibleUserIds.push(responsibleUser.id)

        // Link responsible to student
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

      // 9. Create emergency contacts
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

      await trx.commit()

      return response.created({
        success: true,
        studentId: student.id,
        message: 'Matrícula realizada com sucesso! Aguarde a análise dos documentos.',
      })
    } catch (error) {
      await trx.rollback()
      console.error('Enrollment error:', error)
      return response.internalServerError({
        message: 'Erro ao processar matrícula. Por favor, tente novamente.',
      })
    }
  }
}
