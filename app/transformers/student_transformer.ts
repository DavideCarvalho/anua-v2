import { BaseTransformer } from '@adonisjs/core/transformers'
import type Student from '#models/student'
import UserTransformer from '#transformers/user_transformer'
import StudentDocumentTransformer from '#transformers/student_document_transformer'
import StudentBalanceTransactionTransformer from '#transformers/student_balance_transaction_transformer'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'
import StudentHasResponsibleTransformer from '#transformers/student_has_responsible_transformer'
import ClassTransformer from '#transformers/class_transformer'
import StudentGamificationTransformer from '#transformers/student_gamification_transformer'
import StudentHasLevelTransformer from '#transformers/student_has_level_transformer'
import StudentAddressTransformer from '#transformers/student_address_transformer'
import StudentMedicalInfoTransformer from '#transformers/student_medical_info_transformer'
import StudentEmergencyContactTransformer from '#transformers/student_emergency_contact_transformer'
import OccurrenceTransformer from '#transformers/occurrence_transformer'

export default class StudentTransformer extends BaseTransformer<Student> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'descountPercentage',
        'monthlyPaymentAmount',
        'isSelfResponsible',
        'paymentDate',
        'classId',
        'contractId',
        'canteenLimit',
        'balance',
        'enrollmentStatus',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.depth(6),
      documents: StudentDocumentTransformer.transform(this.whenLoaded(this.resource.documents)),
      balanceTransactions: StudentBalanceTransactionTransformer.transform(
        this.whenLoaded(this.resource.balanceTransactions)
      ),
      payments: StudentPaymentTransformer.transform(this.whenLoaded(this.resource.payments)),
      responsibles: StudentHasResponsibleTransformer.transform(
        this.whenLoaded(this.resource.responsibles)
      )?.depth(6),
      class: ClassTransformer.transform(this.whenLoaded(this.resource.class))?.depth(6),
      gamification: StudentGamificationTransformer.transform(
        this.whenLoaded(this.resource.gamification)
      ),
      levels: StudentHasLevelTransformer.transform(this.whenLoaded(this.resource.levels))?.depth(6),
      address: StudentAddressTransformer.transform(this.whenLoaded(this.resource.address))?.depth(
        6
      ),
      medicalInfo: StudentMedicalInfoTransformer.transform(
        this.whenLoaded(this.resource.medicalInfo)
      )?.depth(6),
      emergencyContacts: StudentEmergencyContactTransformer.transform(
        this.whenLoaded(this.resource.emergencyContacts)
      ),
      occurrences: OccurrenceTransformer.transform(this.whenLoaded(this.resource.occurrences)),
    }
  }
}
