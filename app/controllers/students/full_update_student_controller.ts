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
import { fullUpdateStudentValidator } from '#validators/student'
import AppException from '#exceptions/app_exception'
import type { EmergencyContactRelationship } from '#models/student_emergency_contact'

export default class FullUpdateStudentController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx

    const student = await Student.query()
      .where('id', params.id)
      .preload('user')
      .preload('address')
      .preload('medicalInfo', (q) => q.preload('medications'))
      .preload('emergencyContacts')
      .preload('responsibles')
      .first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const data = await request.validateUsing(fullUpdateStudentValidator)

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
    const studentDoc = data.basicInfo.documentNumber?.replace(/\D/g, '') || ''
    const responsibleDocs = data.responsibles.map((r) => r.documentNumber.replace(/\D/g, ''))

    // Check if student document matches any responsible
    if (studentDoc) {
      const conflictWithResponsible = data.responsibles.find(
        (r) => r.documentNumber.replace(/\D/g, '') === studentDoc
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

    // Get STUDENT_RESPONSIBLE role for creating responsibles
    const responsibleRole = await Role.findBy('name', 'STUDENT_RESPONSIBLE')
    if (!responsibleRole && !data.basicInfo.isSelfResponsible && data.responsibles.length > 0) {
      throw AppException.internalServerError('Role STUDENT_RESPONSIBLE não encontrada')
    }

    const trx = await db.transaction()

    try {
      // 1. Update User
      student.user.merge({
        name: data.basicInfo.name,
        email: data.basicInfo.email || null,
        phone: data.basicInfo.phone || null,
        birthDate: DateTime.fromISO(data.basicInfo.birthDate),
        documentType: data.basicInfo.documentType,
        documentNumber: data.basicInfo.documentNumber || null,
        whatsappContact: data.basicInfo.whatsappContact,
      })
      await student.user.useTransaction(trx).save()

      // 2. Update Student
      student.merge({
        isSelfResponsible: data.basicInfo.isSelfResponsible,
      })
      await student.useTransaction(trx).save()

      // 3. Update/Create Responsibles
      const responsibleUserIds: string[] = []
      if (!data.basicInfo.isSelfResponsible) {
        // Get existing responsible IDs
        const existingResponsibleIds = student.responsibles.map((r) => r.responsibleId)

        // Process each responsible in the form
        for (const respData of data.responsibles) {
          let responsibleUser: User

          // Check if responsible already exists by document
          const existingResponsible = await User.query({ client: trx })
            .where('documentNumber', respData.documentNumber)
            .first()

          if (existingResponsible) {
            responsibleUser = existingResponsible
            // Update existing responsible data (skip email if already verified)
            responsibleUser.merge({
              name: respData.name,
              ...(!existingResponsible.emailVerifiedAt && respData.email
                ? { email: respData.email }
                : {}),
              phone: respData.phone,
              birthDate: DateTime.fromISO(respData.birthDate),
              documentType: respData.documentType,
            })
            await responsibleUser.useTransaction(trx).save()
          } else {
            // Create new responsible user
            const respId = uuidv7()
            const respSlug = string.slug(respData.name, { lower: true }) + '-' + respId.slice(0, 8)

            responsibleUser = await User.create(
              {
                id: respId,
                name: respData.name,
                slug: respSlug,
                email: respData.email,
                phone: respData.phone,
                birthDate: DateTime.fromISO(respData.birthDate),
                documentType: respData.documentType,
                documentNumber: respData.documentNumber,
                schoolId: student.user.schoolId,
                roleId: responsibleRole!.id,
                active: true,
              },
              { client: trx }
            )
          }

          responsibleUserIds.push(responsibleUser.id)

          // Check if link exists
          const existingLink = await StudentHasResponsible.query({ client: trx })
            .where('studentId', student.id)
            .where('responsibleId', responsibleUser.id)
            .first()

          if (existingLink) {
            // Update existing link
            existingLink.merge({
              isPedagogical: respData.isPedagogical,
              isFinancial: respData.isFinancial,
            })
            await existingLink.useTransaction(trx).save()
          } else {
            // Create new link
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

          // Remove from existingResponsibleIds
          const idx = existingResponsibleIds.indexOf(responsibleUser.id)
          if (idx > -1) {
            existingResponsibleIds.splice(idx, 1)
          }
        }

        // Remove responsibles that are no longer in the form
        for (const respId of existingResponsibleIds) {
          await StudentHasResponsible.query({ client: trx })
            .where('studentId', student.id)
            .where('responsibleId', respId)
            .delete()
        }
      } else {
        // Remove all responsibles if self responsible
        await StudentHasResponsible.query({ client: trx }).where('studentId', student.id).delete()
      }

      // 4. Update Address
      if (student.address) {
        student.address.merge({
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement || null,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
        })
        await student.address.useTransaction(trx).save()
      } else {
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
      }

      // 5. Update Medical Info
      let medicalInfoId: string
      if (student.medicalInfo) {
        student.medicalInfo.merge({
          conditions: data.medicalInfo.conditions || null,
        })
        await student.medicalInfo.useTransaction(trx).save()
        medicalInfoId = student.medicalInfo.id
      } else {
        const newMedicalInfo = await StudentMedicalInfo.create(
          {
            id: uuidv7(),
            studentId: student.id,
            conditions: data.medicalInfo.conditions || null,
          },
          { client: trx }
        )
        medicalInfoId = newMedicalInfo.id
      }

      // 6. Update Medications
      // Delete existing and recreate
      await StudentMedication.query({ client: trx }).where('medicalInfoId', medicalInfoId).delete()

      if (data.medicalInfo.medications && data.medicalInfo.medications.length > 0) {
        for (const med of data.medicalInfo.medications) {
          await StudentMedication.create(
            {
              id: uuidv7(),
              medicalInfoId: medicalInfoId,
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              instructions: med.instructions || null,
            },
            { client: trx }
          )
        }
      }

      // 7. Update Emergency Contacts
      // Delete existing and recreate
      await StudentEmergencyContact.query({ client: trx }).where('studentId', student.id).delete()

      for (const contact of data.medicalInfo.emergencyContacts) {
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
            relationship: contact.relationship as EmergencyContactRelationship,
            order: contact.order,
          },
          { client: trx }
        )
      }

      await trx.commit()

      // Load student with relationships
      const updatedStudent = await Student.query()
        .where('id', student.id)
        .preload('user')
        .preload('address')
        .preload('responsibles', (query) => {
          query.preload('responsible')
        })
        .firstOrFail()

      return response.ok({
        message: 'Aluno atualizado com sucesso',
        student: updatedStudent,
      })
    } catch (error) {
      await trx.rollback()
      console.error('Error updating student:', error)
      throw error
    }
  }
}
